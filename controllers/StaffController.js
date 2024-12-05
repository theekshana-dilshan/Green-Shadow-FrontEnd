const staffIdRegEx = /^S[0-9]{3}$/;
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
                                onclick="viewStaffDetails('${staff.staffId}')">View More</button>
                        </td>
                        <td>
                            <button class="btn btn-danger btn-sm" onclick="deleteStaff('${staff.staffId}')">Delete</button>
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
            // Populate modal with staff details
            $("#editStaffId").val(staff.staffId);
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
            $("#editField").val(staff.field);
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
            url: `http://localhost:8080/api/v1/staff/api/v1/staff/${staffId}`,
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

$("#btnStaffSave").on('click', function () {
    // Get values from input fields in the 'Add Staff' modal
    const id = $("#staffId").val();
    const firstName = $("#firstName").val();
    const lastName = $("#lastName").val();
    const designation = $("#designation").val();
    const gender = $("#gender").val();
    const joinedDate = $("#joinedDate").val();
    const dob = $("#dob").val(); // Expecting `yyyy-MM-dd` input format
    const address = $("#address").val();
    const contact = $("#contact").val();
    const email = $("#email").val();
    const role = $("#role").val();
    const field = $("#field").val();
    const vehicle = $("#vehicle").val();

    if (!code || !firstName || !lastName || !designation || !gender || !dob || !address || !contact || !email || !role) {
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
        fieldCodes: field ? field.split(",") : [], 
        vehicle: vehicle
    };

    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: "http://localhost:8080/api/v1/staff",
        type: "POST",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        data: JSON.stringify(staffData), 
        success: (response) => {
            console.log("Staff added successfully:", response);
            alert("Staff added successfully!");
            clearFields(); // Clear input fields after success
            fieldIdGenerate(); // Regenerate field IDs if necessary
        },
        error: (xhr, status, error) => {
            console.error("Error adding staff:", xhr.responseText || error);
            if (xhr.responseText) {
                alert("Failed to add staff: " + xhr.responseText);
            } else {
                alert("Failed to add staff. Please try again.");
            }
        }
    });
});


// Clear fields function to reset inputs after submission
function clearFields() {
    $("#staffId").val('');
    $("#firstName").val('');
    $("#lastName").val('');
    $("#designation").val('');
    $("#gender").val('');
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
        url: "http://localhost:8080/api/v1/field", // API endpoint to fetch fields
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
        joinedDate: $("#editJoinedDate").val(), // Ensure the format is `yyyy-MM-dd`
        dob: $("#editDOB").val(), // Ensure the format is `yyyy-MM-dd`
        contact: $("#editContact").val(),
        address: $("#editAddress").val(),
        email: $("#editEmail").val(),
        role: $("#editRole").val(),
        fieldCodes: $("#editField").val() ? $("#editField").val().split(",") : [], // Split multiple fields if provided
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
        url: `http://localhost:8080/api/v1/staff/${updateStaffDTO.id}`, // Update endpoint
        type: "PUT",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        data: JSON.stringify(updateStaffDTO), // Convert object to JSON string
        success: function () {
            alert("Staff details updated successfully!");
            $("#viewStaffModal").modal("hide"); // Close modal after success
            loadStaffTable(); // Reload staff table to reflect changes
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText || xhr.statusText);
            alert(`Failed to update staff details. Error: ${xhr.responseText || xhr.statusText}`);
        }
    });
});


staffIdGenerate();
function staffIdGenerate() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: "http://localhost:8080/api/v1/staff", // API endpoint to fetch fields
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
    loadStaffTable();

    $("#staffId, #firstName, #lastName, #contact, #email").on("keyup blur", checkStaffValidity);
});
