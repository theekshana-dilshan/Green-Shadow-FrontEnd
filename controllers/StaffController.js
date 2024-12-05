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

    $.ajax({
        url: "http://localhost:8080/api/v1/staff",
        method: "GET",
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
    // Fetch staff details by staffId
    $.ajax({
        url: `http://localhost:8080/api/v1/staff/${staffId}`,
        method: "GET",
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
        // Make AJAX request to delete the staff
        $.ajax({
            url: `http://localhost:8080/api/v1/staff/api/v1/staff/${staffId}`,
            method: "DELETE",
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
    const code = $("#staffId").val();
    const firstName = $("#firstName").val();
    const lastName = $("#lastName").val();
    const designation = $("#designation").val();
    const gender = $("#gender").val();
    const dob = $("#dob").val(); // Expecting `yyyy-MM-dd` input format
    const address = $("#address").val();
    const contact = $("#contact").val();
    const email = $("#email").val();
    const role = $("#role").val();
    const field = $("#field").val();
    const vehicle = $("#vehicle").val();

    // Validate required fields
    if (!code || !firstName || !lastName || !designation || !gender || !dob || !address || !contact || !email || !role) {
        alert("All fields are required!");
        return;
    }

    // Create JSON object for the staff data
    const staffData = {
        id: code,
        firstName: firstName,
        lastName: lastName,
        designation: designation,
        gender: gender,
        dob: dob, // Ensure format is `yyyy-MM-dd`
        address: address,
        contact: contact,
        email: email,
        role: role,
        fieldCodes: field ? field.split(",") : [], // Split multiple fields into an array if needed
        vehicle: vehicle
    };

    // Send AJAX POST request to the backend
    $.ajax({
        url: "http://localhost:8080/api/v1/staff", // Backend endpoint
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(staffData), // Convert staffData object to JSON string
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
    $.ajax({
        url: "http://localhost:8080/api/v1/field", // API endpoint to fetch fields
        type: "GET",
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

function deleteStaff(id) {
    if (confirm("Are you sure you want to delete this staff?")) {
        $.ajax({
            url: `http://localhost:8080/api/v1/staff/${id}`,
            method: "DELETE",
            success: () => {
                alert("Staff deleted successfully!");
                loadStaffTable();
            },
            error: (xhr) => console.error("Failed to delete staff:", xhr.status),
        });
    }
}

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

    // Send AJAX PUT request
    $.ajax({
        url: `http://localhost:8080/api/v1/staff/${updateStaffDTO.id}`, // Update endpoint
        type: "PUT",
        contentType: "application/json",
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
    $.ajax({
        url: "http://localhost:8080/api/v1/staff", // API endpoint to fetch fields
        type: "GET",
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

            // If response is empty or no valid fieldCode found, set default value
            $("staffId").val("STAFF-0001");
        },
        error: function (xhr, status, error) {
            console.error("Error fetching last Field ID:", error);
            alert("Unable to fetch the last Field ID. Using default ID.");
            $("staffId").val("FIELD-0001"); // Set default ID in case of error
        }
    });
}

$(document).ready(() => {
    loadStaffTable();

    $("#staffId, #firstName, #lastName, #contact, #email").on("keyup blur", checkStaffValidity);
});
