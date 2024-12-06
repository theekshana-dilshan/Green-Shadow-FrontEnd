const staffIdRegEx = /^STAFF-\d{4}$/;
const nameRegEx = /^[A-Za-z ]{3,50}$/;
const contactRegEx = /^[0-9]{10}$/;
const emailRegEx = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

let staffValidations = [
    { reg: staffIdRegEx, field: $("#staffId"), error: "Staff ID Pattern: S001" },
    { reg: nameRegEx, field: $("#firstName"), error: "First Name: 3-50 letters" },
    { reg: nameRegEx, field: $("#lastName"), error: "Last Name: 3-50 letters" },
    { reg: contactRegEx, field: $("#contact"), error: "Contact No: 10 digits" },
    { reg: emailRegEx, field: $("#email"), error: "Email: Valid email address" },
];

function checkStaffValidity() {
    let errorCount = 0;
    for (let validation of staffValidations) {
        if (check(validation.reg, validation.field)) {
            setSuccess(validation.field, "");
        } else {
            errorCount++;
            setError(validation.field, validation.error);
        }
    }
    $("#saveStaff").attr("disabled", errorCount > 0);
}

function check(regex, field) {
    return regex.test(field.val());
}

function setSuccess(field, error) {
    field.css("border", "2px solid green").next().text(error);
}

function setError(field, error) {
    field.css("border", "2px solid red").next().text(error);
}

document.addEventListener('DOMContentLoaded', () => {
    loadStaffTable();
    staffIdGenerate();
});

function loadStaffTable() {
    $("#tblStaff > tbody > tr").remove();

    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: "http://localhost:8080/api/v1/staff",
        method: "GET",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        success: (staffList) => {
            staffList.forEach((staff) => {
                let row = `
                    <tr>
                        <td>${staff.firstName} ${staff.lastName}</td>
                        <td>${staff.designation}</td>
                        <td>${staff.gender}</td>
                        <td>${staff.dob}</td>
                        <td>${staff.address}</td>
                        <td>${staff.contact}</td>
                        <td>${staff.email}</td>
                        <td>
                            <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#viewStaffModal" 
                                onclick="viewStaffDetails('${staff.id}')">View More</button>
                        </td>
                        <td>
                            <button class="btn btn-danger btn-sm" onclick="deleteStaff('${staff.id}')">Delete</button>
                        </td>
                    </tr>`;
                $("#tblStaff tbody").append(row);
            });
        },
        error: (xhr) => console.error("Failed to load staff:", xhr.status),
    });
}

function viewStaffDetails(staffId) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: `http://localhost:8080/api/v1/staff/${staffId}`,
        method: "GET",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        success: (staff) => {
            $("#editStaffId").val(staff.Id);
            $("#editFirstName").val(staff.firstName);
            $("#editLastName").val(staff.lastName);
            $("#editDesignation").val(staff.designation);
            $("#editGender").val(staff.gender);
            $("#editJoinedDate").val(staff.joinedDate);
            $("#editDOB").val(staff.dob);
            $("#editAddress").val(staff.address);
            $("#editContact").val(staff.contact);
            $("#editEmail").val(staff.email);
            $("#editRole").val(staff.role);
            $("#editField").val(staff.fields);
            $("#editVehicle").val(staff.vehicle);
        },
        error: (xhr) => {
            console.error("Failed to fetch staff details:", xhr.status);
        }
    });
}

function deleteStaff(staffId) {
    // Confirm deletion
    if (confirm("Are you sure you want to delete this staff member?")) {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("No token found. Please log in.");
            return;
        }
        $.ajax({
            url: `http://localhost:8080/api/v1/staff/${staffId}`,
            method: "DELETE",
            timeout: 0,
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + token
            },
            success: () => {
                alert("Staff deleted successfully!");
                loadStaffTable();
            },
            error: (xhr) => {
                console.error("Failed to delete staff:", xhr.status);
            }
        });
    }
}

$("#btnStaffSave").on("click",function(){
    saveStaffData();
});


async function saveStaffData() {

    const fieldCode = $("#field").val();
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }

    let fields = [];
    try {
        const fieldResponse = await $.ajax({
            url: `http://localhost:8080/api/v1/field/${fieldCode}`,
            method: "GET",
            timeout: 0,
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + token,
            }
        });
        console.log("Field data fetched:", fieldResponse);

        fields.push({
            fieldCode: fieldResponse.fieldCode,
            fieldName: fieldResponse.fieldName,
            fieldLocation: fieldResponse.fieldLocation,
            fieldSize: fieldResponse.fieldSize,
            fieldImage: fieldResponse.fieldImage,
        });
    } catch (error) {
        console.error("Failed to load field data:", error);
        alert("Failed to load field data. Please try again.");
        return; // Stop execution if field data cannot be loaded
    }

    // Collect staff data
    const id = $("#staffId").val();
    const firstName = $("#firstName").val();
    const lastName = $("#lastName").val();
    const designation = $("#designation").val();
    const gender = $("#gender").val();
    const joinedDate = $("#joinedDate").val();
    const dob = $("#dob").val();
    const address = $("#address").val();
    const contact = $("#contact").val();
    const email = $("#email").val();
    const role = $("#role").val();

    if (!id || !firstName || !lastName || !designation || !gender || !dob || !address || !contact || !email || !role) {
        alert("All fields are required!");
        return;
    }

    const staffData = {
        id: id,
        firstName: firstName,
        lastName: lastName,
        designation: designation,
        gender: gender,
        joinedDate: joinedDate,
        dob: dob,
        address: address,
        contact: contact,
        email: email,
        role: role,
        fields
    };

    console.log("Prepared staff data:", staffData);

    // Save staff data
    try {
        const response = await $.ajax({
            url: "http://localhost:8080/api/v1/staff",
            type: "POST",
            timeout: 0,
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + token
            },
            data: JSON.stringify(staffData),
        });
        console.log("Staff added successfully:", response);
        alert("Staff added successfully!");
        clearFields();
        staffIdGenerate();
        loadStaffTable();
    } catch (xhr) {
        console.error("Error adding staff:", xhr.responseText || xhr.statusText);
        alert("Failed to add staff: " + (xhr.responseText || xhr.statusText));
    }
}



// Clear fields function to reset inputs after submission
function clearFields() {
    $("#firstName").val('');
    $("#lastName").val('');
    $("#designation").val('');
    $("#gender").val('');
    $("joinedDate").val('');
    $("#dob").val('');
    $("#address").val('');
    $("#contact").val('');
    $("#email").val('');
    $("#role").val('');
    $("#field").val('');
    $("#vehicle").val('');
}

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
                // Clear existing options
                $("#field").empty();

                // Populate the dropdown with fieldCodes
                response.forEach(function (field) {
                    if (field.fieldCode) { // Ensure fieldCode exists
                        $("#field").append(
                            `<option value="${field.fieldCode}">${field.fieldCode}</option>`
                        );
                    }
                });

                // If no valid fieldCode found, set default option
                if ($("#field").children().length === 0) {
                    $("#field").append(
                        `<option value="FIELD-0001">FIELD-0001</option>`
                    );
                }
            } else {
                console.warn("Invalid response format. Setting default field ID.");
                $("#field").html(
                    `<option value="FIELD-0001">FIELD-0001</option>`
                );
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching fields:", error);
            alert("Unable to fetch fields. Using default field ID.");
            $("#field").html(
                `<option value="FIELD-0001">FIELD-0001</option>`
            );
        }
    });
}

setfieldId();

document.getElementById("btnUpdateStaff").addEventListener("click", function () {
    // Collect input values from update form
    const updateStaffDTO = {
        id: $("#editStaffId").val(),
        firstName: $("#editFirstName").val(),
        lastName: $("#editLastName").val(),
        designation: $("#editDesignation").val(),
        gender: $("#editGender").val(),
        joinedDate: $("#editJoinedDate").val(),
        dob: $("#editDOB").val(),
        contact: $("#editContact").val(),
        address: $("#editAddress").val(),
        email: $("#editEmail").val(),
        role: $("#editRole").val(),
        fieldCodes: $("#editField").val() ? $("#editField").val().split(",") : [],
        vehicle: $("#editVehicle").val()
    };

    // Validate input fields
    const isInvalid = Object.values(updateStaffDTO).some((field) => !field);
    if (isInvalid) {
        alert("All fields are required!");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: `http://localhost:8080/api/v1/staff/${updateStaffDTO.id}`,
        type: "PUT",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        data: JSON.stringify(updateStaffDTO),
        success: function () {
            alert("Staff details updated successfully!");
            $("#viewStaffModal").modal("hide");
            loadStaffTable(); 
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText || xhr.statusText);
            alert(`Failed to update staff details. Error: ${xhr.responseText || xhr.statusText}`);
        }
    });
});


function staffIdGenerate() {
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
            // Validate the response is an array
            if (Array.isArray(response) && response.length > 0) {
                // Sort the array by fieldCode in ascending order (if necessary)
                response.sort((a, b) => a.id.localeCompare(b.id));

                // Get the last field in the sorted array
                const lastField = response[response.length - 1];

                // Validate that fieldCode exists and follows the expected format
                if (lastField && lastField.id) {
                    const lastFieldCode = lastField.id;

                    // Split the fieldCode using '-' and extract the numeric part
                    const lastIdParts = lastFieldCode.split('-');
                    if (lastIdParts.length === 2 && !isNaN(lastIdParts[1])) {
                        const lastNumber = parseInt(lastIdParts[1], 10);

                        // Generate the next ID
                        const nextId = `STAFF-${String(lastNumber + 1).padStart(4, '0')}`;
                        $("#staffId").val(nextId);
                        return;
                    }
                }
            }

            $("staffId").val("STAFF-0001");
        },
        error: function (xhr, status, error) {
            console.error("Error fetching last staff ID:", error);
            alert("Unable to fetch the last staff ID. Using default ID.");
            $("staffId").val("STAFF-0001");
        }
    });
}

$(document).ready(() => {
    $("#staffId, #firstName, #lastName, #contact, #email").on("keyup blur", checkStaffValidity);
});
