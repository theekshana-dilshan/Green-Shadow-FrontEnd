// Regular Expressions
const equipmentIdRegEx = /^[A-Z0-9]{3,10}$/;
const equipmentNameRegEx = /^[A-Za-z ]{3,50}$/;
const equipmentTypeRegEx = /^[A-Za-z ]{3,30}$/;
const equipmentStatusRegEx = /^[A-Za-z ]{3,30}$/;
const staffDetailsRegEx = /^[A-Za-z ]{3,50}$/;
const fieldDetailsRegEx = /^[A-Za-z0-9 ]{3,50}$/;

// Validation Configuration
let equipmentValidations = [
    { reg: equipmentIdRegEx, field: $("#equipmentId"), error: "ID: 3-10 alphanumeric characters" },
    { reg: equipmentNameRegEx, field: $("#equipmentName"), error: "Name: 3-50 letters" },
    { reg: equipmentTypeRegEx, field: $("#equipmentType"), error: "Type: 3-30 letters" },
    { reg: equipmentStatusRegEx, field: $("#equipmentStatus"), error: "Status: 3-30 letters" },
    { reg: staffDetailsRegEx, field: $("#staffDetails"), error: "Staff Details: 3-50 letters" },
    { reg: fieldDetailsRegEx, field: $("#fieldDetails"), error: "Field Details: 3-50 alphanumeric characters" },
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


function loadEquipmentTable() {
    $("#tblEquipment > tbody > tr").remove();

    $.ajax({
        url: "http://localhost:8080/Bootstrap_POS_Backend_Phase_02/api/v1/equipment",
        method: "GET",
        success: (equipments) => {
            equipments.forEach((equipment) => {
                let row = `
                    <tr>
                        <td>${equipment.equipmentId}</td>
                        <td>${equipment.name}</td>
                        <td>${equipment.type}</td>
                        <td>${equipment.status}</td>
                        <td>${equipment.staffDetails}</td>
                        <td>${equipment.fieldDetails}</td>
                        <td>
                            <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#viewEquipmentModal" 
                                onclick="populateEquipmentDetails('${equipment.equipmentId}', '${equipment.name}', '${equipment.type}', '${equipment.status}', '${equipment.staffDetails}', '${equipment.fieldDetails}')">View More</button>
                        </td>
                        <td>
                            <button class="btn btn-danger btn-sm" onclick="deleteEquipment('${equipment.equipmentId}')">Delete</button>
                        </td>
                    </tr>`;
                $("#tblEquipment tbody").append(row);
            });
        },
        error: (xhr) => console.error("Failed to load equipment:", xhr.status),
    });
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

    $.ajax({
        url: "http://localhost:5050/green/api/v1/equ",
        method: "GET",
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
    $.ajax({
        url: `http://localhost:5050/green/api/v1/equ/${equipmentId}`,
        method: "GET",
        contentType: "application/json",
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
        $.ajax({
            url: `http://localhost:5050/green/api/v1/equ/${equipmentId}`,
            method: "DELETE",
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

    var formData = new FormData();
    formData.append("equipmentId", equipmentId);
    formData.append("name", equipmentName);
    formData.append("equipmentType", equipmentType);
    formData.append("status", equipmentStatus);
    formData.append("assignedStaffDetails", assignedStaff);
    formData.append("assignedFieldDetails", assignedField);

    $.ajax({
        url: "http://localhost:5050/green/api/v1/equ",
        type: "POST",
        processData: false,
        contentType: false,
        data: formData,
        success: (response) => {
            console.log("Equipment added successfully:", response);
            alert("Equipment added successfully!");
            clearEquipmentFields();
            refreshEquipmentTable();
        },
        error: (error) => {
            console.error("Error adding equipment:", error);
            alert("Failed to add equipment. Please try again.");
        }
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

setfieldId();
function setfieldId() {
    $.ajax({
        url: "http://localhost:5050/green/api/v1/field",
        type: "GET",
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
    $.ajax({
        url: "http://localhost:5050/green/api/v1/staff",
        type: "GET",
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
                        `<option value="FIELD-0001">FIELD-0001</option>`
                    );
                }
            } else {
                console.warn("Invalid response format. Setting default field ID.");
                $("#staffDetails").html(
                    `<option value="FIELD-0001">FIELD-0001</option>`
                );
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching fields:", error);
            alert("Unable to fetch fields. Using default field ID.");
            $("#staffDetails").html(
                `<option value="FIELD-0001">FIELD-0001</option>`
            );
        }
    });
}

document.getElementById("equUpdateBtn").addEventListener("click", function () {
    const equId = $("#editEquipmentId").val();
    const equName =$("#editEquipmentName").val();
    const equType =$("#editEquipmentType").val();
    const equStatus = $("#editEquipmentStatus").val();
    const equStaff =$("#editStaffDetails").val();
    const equField =$("#editFieldDetails").val();

    if (!equId || !equName || !equType || !equStatus || !equStaff || !equField) {
        alert("All Equipment are required!");
        return;
    }

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

    $.ajax({
        url: `http://localhost:5050/green/api/v1/equ/${formData.equipmentId}`,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify(formData),
        success: function () {
            alert("Equipment details updated successfully!");
            document.getElementById("updateModal").style.display = "none";
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText || xhr.statusText);
            alert(`Failed to update vehicle details. Error: ${xhr.responseText || xhr.statusText}`);
        },
    });
});

// function saveEquipmentDetails() {
//     const updatedEquipment = {
//         equipmentId: $("#editEquipmentId").val(),
//         name: $("#editEquipmentName").val(),
//         type: $("#editEquipmentType").val(),
//         status: $("#editEquipmentStatus").val(),
//         staffDetails: $("#editStaffDetails").val(),
//         fieldDetails: $("#editFieldDetails").val(),
//     };

//     $.ajax({
//         url: `http://localhost:8080/Bootstrap_POS_Backend_Phase_02/api/v1/equipment/${updatedEquipment.equipmentId}`,
//         method: "PATCH",
//         contentType: "application/json",
//         data: JSON.stringify(updatedEquipment),
//         success: () => {
//             alert("Equipment updated successfully!");
//             $("#viewEquipmentModal").modal("hide");
//             loadEquipmentTable();
//         },
//         error: (xhr) => console.error("Failed to update equipment:", xhr.status),
//     });
// }

$(document).ready(() => {
    loadEquipmentTable();
    $("#equipmentId, #equipmentName, #equipmentType, #equipmentStatus, #staffDetails, #fieldDetails").on("keyup blur", checkEquipmentValidity);
});
