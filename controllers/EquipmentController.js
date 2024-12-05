// Regular Expressions
const equipmentIdRegEx = /^EQUIPMENT-\d{4}$/;
const equipmentNameRegEx = /^[A-Za-z ]{3,50}$/;
const equipmentTypeRegEx = /^[A-Za-z ]{3,30}$/;
const equipmentStatusRegEx = /^[A-Za-z ]{3,30}$/;

// Validation Configuration
let equipmentValidations = [
    { reg: equipmentIdRegEx, field: $("#equipmentId"), error: "ID: 3-10 alphanumeric characters" },
    { reg: equipmentNameRegEx, field: $("#equipmentName"), error: "Name: 3-50 letters" },
    { reg: equipmentTypeRegEx, field: $("#equipmentType"), error: "Type: 3-30 letters" },
    { reg: equipmentStatusRegEx, field: $("#equipmentStatus"), error: "Status: 3-30 letters" }
];

function checkEquipmentValidity() {
    let errorCount = 0;
    for (let validation of equipmentValidations) {
        if (check(validation.reg, validation.field)) {
            setSuccess(validation.field, "");
        } else {
            errorCount++;
            setError(validation.field, validation.error);
        }
    }
    $("#saveEquipment").attr("disabled", errorCount > 0);
}

function check(regex, field) {
    return regex.test(field.val());
}

function setSuccess(field, error) {
    field.css("border", "2px solid green").next(".error-message").text(error);
}

function setError(field, error) {
    field.css("border", "2px solid red").next(".error-message").text(error);
}


function populateEquipmentDetails(id, name, type, status, staff, field) {
    $("#editEquipmentId").val(id);
    $("#editEquipmentName").val(name);
    $("#editEquipmentType").val(type);
    $("#editEquipmentStatus").val(status);
    $("#editStaffDetails").val(staff);
    $("#editFieldDetails").val(field);
}

function closeModal() {
    document.getElementById("viewEquipmentModal").style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById("viewEquipmentModal");
    if (event.target == modal) {
        closeModal();
    }
}

function loadEquipmentTable() {
    $("#equipmentTable > tbody > tr").remove();

    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: "http://localhost:8080/api/v1/equipment",
        method: "GET",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        success: (equipmentList) => {
            equipmentList.forEach((equipment) => {
                let row = `
                    <tr>
                        <td>${equipment.equipmentId}</td>
                        <td>${equipment.name}</td>
                        <td>${equipment.equipmentType}</td>
                        <td>${equipment.status}</td>
                        <td>${equipment.assignedStaffDetails}</td>
                        <td>${equipment.assignedFieldDetails}</td>
                        <td>
                            <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#viewEquipmentModal" 
                                onclick="viewEquipmentDetails('${equipment.equipmentId}')">View More</button>
                        </td>
                        <td>
                            <button class="btn btn-danger btn-sm" onclick="deleteEquipment('${equipment.equipmentId}')">Delete</button>
                        </td>
                    </tr>`;
                $("#equipmentTable tbody").append(row);
            });
        },
        error: (xhr) => console.error("Failed to load equipment:", xhr.status),
    });
}

function viewEquipmentDetails(equipmentId) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: `http://localhost:8080/api/v1/equipment/${equipmentId}`,
        method: "GET",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        success: (equipment) => {
            if (!equipment) {
                alert("No data found for the selected equipment.");
                return;
            }

            console.log(equipment);

            $("#editEquipmentId").val(equipment.equipmentId);
            $("#editEquipmentName").val(equipment.name);
            $("#editEquipmentType").val(equipment.equipmentType || "N/A");
            $("#editEquipmentStatus").val(equipment.status || "N/A");
            $("#editStaffDetails").val(equipment.assignedStaffDetails || "N/A");
            $("#editFieldDetails").val(equipment.assignedFieldDetails || "N/A");
        },
        error: (xhr, status, error) => {
            console.error("Error fetching equipment details:", error);
            alert("Failed to fetch equipment details. Please try again.");
        }
    });
}

function deleteEquipment(equipmentId) {
    if (confirm(`Are you sure you want to delete equipment with ID: ${equipmentId}?`)) {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("No token found. Please log in.");
            return;
        }
        $.ajax({
            url: `http://localhost:8080/api/v1/equipment/${equipmentId}`,
            method: "DELETE",
            timeout: 0,
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + token
            },
            success: () => {
                alert("Equipment deleted successfully.");
                loadEquipmentTable(); // Refresh the table
            },
            error: (xhr, status, error) => {
                console.error("Error deleting equipment:", error);
                alert("Failed to delete equipment. Please try again.");
            }
        });
    }
}

$("#saveEquipment").on("click", function () {
    var equipmentId = $("#equipmentId").val();
    var equipmentName = $("#equipmentName").val();
    var equipmentType = $("#equipmentType").val();
    var equipmentStatus = $("#equipmentStatus").val();
    var assignedStaff = $("#staffDetails").val();
    var assignedField = $("#fieldDetails").val();

    if (!equipmentId || !equipmentName || !equipmentType || !equipmentStatus || !assignedStaff || !assignedField) {
        alert("All fields are required.");
        return;
    }

    var data = {
        equipmentId: equipmentId,
        name: equipmentName,
        equipmentType: equipmentType,
        status: equipmentStatus,
        assignedStaffDetails: assignedStaff,
        assignedFieldDetails: assignedField,
    };

    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: "http://localhost:8080/api/v1/equipment",
        type: "POST",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        data: JSON.stringify(data),
        success: (response) => {
            console.log("Equipment added successfully:", response);
            alert("Equipment added successfully!");
            clearEquipmentFields();
            refreshEquipmentTable();
        },
        error: (error) => {
            console.error("Error adding equipment:", error);
            alert("Failed to add equipment. Please try again.");
        },
    });
});


function clearEquipmentFields() {
    $("#equipmentId").val("");
    $("#equipmentName").val("");
    $("#equipmentType").val("");
    $("#equipmentStatus").val("");
    $("#staffDetails").val("");
    $("#fieldDetails").val("");
}

function refreshEquipmentTable() {
    loadEquipmentTable();
}

EquipmetIdGenerate();
function EquipmetIdGenerate() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: "http://localhost:8080/api/v1/equipment",
        type: "GET",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        success: function (response) {
            if (Array.isArray(response) && response.length > 0) {
                response.sort((a, b) => a.id.localeCompare(b.id));

                const lastEquipmet = response[response.length - 1];

                if (lastEquipmet && lastEquipmet.e) {
                    const lastEquipmetCode = lastEquipmet.EquipmentId;

                    const lastIdParts = lastEquipmetCode.split('-');
                    if (lastIdParts.length === 2 && !isNaN(lastIdParts[1])) {
                        const lastNumber = parseInt(lastIdParts[1], 10);

                        const nextId = `EQUIPMENT-${String(lastNumber + 1).padStart(4, '0')}`;
                        $("#equipmentId").val(nextId);
                        return;
                    }
                }
            }

            $("equipmentId").val("EQUIPMENT-0001");
        },
        error: function (xhr, status, error) {
            console.error("Error fetching last equipment ID:", error);
            alert("Unable to fetch the last equipment ID. Using default ID.");
            $("equipmentId").val("EQUIPMENT-0001");
        }
    });
}

setfieldId();
function setfieldId() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: "http://localhost:8080/api/v1/field",
        type: "GET",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        success: function (response) {
            if (Array.isArray(response)) {
                $("#fieldDetails").empty();

                response.forEach(function (field) {
                    if (field.fieldCode) {
                        $("#fieldDetails").append(
                            `<option value="${field.fieldCode}">${field.fieldCode}</option>`
                        );
                    }
                });

                if ($("#fieldDetails").children().length === 0) {
                    $("#fieldDetails").append(
                        `<option value="FIELD-0001">FIELD-0001</option>`
                    );
                }
            } else {
                console.warn("Invalid response format. Setting default field ID.");
                $("#fieldDetails").html(
                    `<option value="FIELD-0001">FIELD-0001</option>`
                );
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching fields:", error);
            alert("Unable to fetch fields. Using default field ID.");
            $("#fieldDetails").html(
                `<option value="FIELD-0001">FIELD-0001</option>`
            );
        }
    });
}

setStaffId();
function setStaffId() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: "http://localhost:8080/api/v1/staff",
        type: "GET",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        success: function (response) {
            if (Array.isArray(response)) {
                $("#staffDetails").empty();

                response.forEach(function (staff) {
                    if (staff.id) {
                        $("#staffDetails").append(
                            `<option value="${staff.id}">${staff.id}</option>`
                        );
                    }
                });

                if ($("#staffDetails").children().length === 0) {
                    $("#staffDetails").append(
                        `<option value="STAFF-0001">STAFF-0001</option>`
                    );
                }
            } else {
                console.warn("Invalid response format. Setting default field ID.");
                $("#staffDetails").html(
                    `<option value="STAFF-0001">STAFF-0001</option>`
                );
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching fields:", error);
            alert("Unable to fetch fields. Using default field ID.");
            $("#staffDetails").html(
                `<option value="STAFF-0001">STAFF-0001</option>`
            );
        }
    });
}

document.getElementById("equUpdateBtn").addEventListener("click", function () {
    // Collect input values
    const equId = $("#editEquipmentId").val();
    const equName = $("#editEquipmentName").val();
    const equType = $("#editEquipmentType").val();
    const equStatus = $("#editEquipmentStatus").val();
    const equStaff = $("#editStaffDetails").val();
    const equField = $("#editFieldDetails").val();

    if (!equId || !equName || !equType || !equStatus || !equStaff || !equField) {
        alert("All fields are required!");
        return;
    }

    // Prepare JSON payload
    const formData = {
        equipmentId: equId,
        name: equName,
        equipmentType: equType,
        status: equStatus,
        staffId: equStaff,
        fieldId: {
            fieldCode: equField,
        },
    };

    console.log("Form data:", formData);

    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: `http://localhost:8080/api/v1/equipment/${formData.equipmentId}`,
        type: "PUT",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        data: JSON.stringify(formData),
        success: function () {
            alert("Equipment details updated successfully!");
            $("#updateModal").modal("hide");
            // Optionally, refresh the equipment table or data here
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText || xhr.statusText);
            alert(`Failed to update equipment details. Error: ${xhr.responseText || xhr.statusText}`);
        },
    });
});


$(document).ready(() => {
    loadEquipmentTable();
    $("#equipmentId, #equipmentName, #equipmentType, #equipmentStatus, #staffDetails, #fieldDetails").on("keyup blur", checkEquipmentValidity);
});
