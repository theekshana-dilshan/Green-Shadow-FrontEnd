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
        url: "http://localhost:8080/Bootstrap_POS_Backend_Phase_02/api/v1/staff",
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
                                onclick="populateStaffDetails('${staff.staffId}', '${staff.firstName}', '${staff.lastName}', '${staff.designation}', '${staff.gender}', '${staff.joinedDate}', '${staff.dob}', '${staff.address}', '${staff.contact}', '${staff.email}', '${staff.role}', '${staff.field}', '${staff.vehicle}')">View More</button>
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

function populateStaffDetails(id, firstName, lastName, designation, gender, joinedDate, dob, address, contact, email, role, field, vehicle) {
    $("#editStaffId").val(id);
    $("#editFirstName").val(firstName);
    $("#editLastName").val(lastName);
    $("#editDesignation").val(designation);
    $("#editGender").val(gender);
    $("#editJoinedDate").val(joinedDate);
    $("#editDOB").val(dob);
    $("#editAddress").val(address);
    $("#editContact").val(contact);
    $("#editEmail").val(email);
    $("#editRole").val(role);
    $("#editField").val(field);
    $("#editVehicle").val(vehicle);
}

function saveNewStaff() {
    const newStaff = {
        staffId: $("#staffId").val(),
        firstName: $("#firstName").val(),
        lastName: $("#lastName").val(),
        designation: $("#designation").val(),
        gender: $("#gender").val(),
        joinedDate: $("#joinedDate").val(),
        dob: $("#dob").val(),
        address: $("#address").val(),
        contact: $("#contact").val(),
        email: $("#email").val(),
        role: $("#role").val(),
        field: $("#field").val(),
        vehicle: $("#vehicle").val(),
    };

    $.ajax({
        url: "http://localhost:8080/Bootstrap_POS_Backend_Phase_02/api/v1/staff",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(newStaff),
        success: () => {
            alert("Staff added successfully!");
            $("#addStaffModal").modal("hide");
            loadStaffTable();
        },
        error: (xhr) => console.error("Failed to add staff:", xhr.status),
    });
}

function saveStaffDetails() {
    const updatedStaff = {
        staffId: $("#editStaffId").val(),
        firstName: $("#editFirstName").val(),
        lastName: $("#editLastName").val(),
        designation: $("#editDesignation").val(),
        gender: $("#editGender").val(),
        joinedDate: $("#editJoinedDate").val(),
        dob: $("#editDOB").val(),
        address: $("#editAddress").val(),
        contact: $("#editContact").val(),
        email: $("#editEmail").val(),
        role: $("#editRole").val(),
        field: $("#editField").val(),
        vehicle: $("#editVehicle").val(),
    };

    $.ajax({
        url: `http://localhost:8080/Bootstrap_POS_Backend_Phase_02/api/v1/staff/${updatedStaff.staffId}`,
        method: "PATCH",
        contentType: "application/json",
        data: JSON.stringify(updatedStaff),
        success: () => {
            alert("Staff details updated successfully!");
            $("#viewStaffModal").modal("hide");
            loadStaffTable();
        },
        error: (xhr) => console.error("Failed to update staff:", xhr.status),
    });
}

function deleteStaff(id) {
    if (confirm("Are you sure you want to delete this staff?")) {
        $.ajax({
            url: `http://localhost:8080/Bootstrap_POS_Backend_Phase_02/api/v1/staff/${id}`,
            method: "DELETE",
            success: () => {
                alert("Staff deleted successfully!");
                loadStaffTable();
            },
            error: (xhr) => console.error("Failed to delete staff:", xhr.status),
        });
    }
}

$(document).ready(() => {
    loadStaffTable();

    $("#staffId, #firstName, #lastName, #contact, #email").on("keyup blur", checkStaffValidity);
});
