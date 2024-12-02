const equipmentValidations = [
    { reg: /^[A-Za-z0-9]+$/, field: $("#equipmentId"), error: "ID: Alphanumeric only" },
    { reg: /^[A-Za-z ]{3,50}$/, field: $("#equipmentName"), error: "Name: 3-50 letters" },
    { reg: /^[A-Za-z ]+$/, field: $("#equipmentType"), error: "Type: Alphabetic only" },
    { reg: /^[A-Za-z ]+$/, field: $("#equipmentStatus"), error: "Status: Alphabetic only" },
    { reg: /^[A-Za-z ]{3,50}$/, field: $("#staffDetails"), error: "Staff: 3-50 letters" },
    { reg: /^[A-Za-z ]{3,50}$/, field: $("#fieldDetails"), error: "Field: 3-50 letters" },
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

function saveEquipmentDetails() {
    const updatedEquipment = {
        equipmentId: $("#editEquipmentId").val(),
        name: $("#editEquipmentName").val(),
        type: $("#editEquipmentType").val(),
        status: $("#editEquipmentStatus").val(),
        staffDetails: $("#editStaffDetails").val(),
        fieldDetails: $("#editFieldDetails").val(),
    };

    $.ajax({
        url: `http://localhost:8080/Bootstrap_POS_Backend_Phase_02/api/v1/equipment/${updatedEquipment.equipmentId}`,
        method: "PATCH",
        contentType: "application/json",
        data: JSON.stringify(updatedEquipment),
        success: () => {
            alert("Equipment updated successfully!");
            $("#viewEquipmentModal").modal("hide");
            loadEquipmentTable();
        },
        error: (xhr) => console.error("Failed to update equipment:", xhr.status),
    });
}

function saveNewEquipment() {
    const newEquipment = {
        equipmentId: $("#equipmentId").val(),
        name: $("#equipmentName").val(),
        type: $("#equipmentType").val(),
        status: $("#equipmentStatus").val(),
        staffDetails: $("#staffDetails").val(),
        fieldDetails: $("#fieldDetails").val(),
    };

    $.ajax({
        url: "http://localhost:8080/Bootstrap_POS_Backend_Phase_02/api/v1/equipment",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(newEquipment),
        success: () => {
            alert("Equipment added successfully!");
            $("#addEquipmentModal").modal("hide");
            loadEquipmentTable();
        },
        error: (xhr) => console.error("Failed to add equipment:", xhr.status),
    });
}

function deleteEquipment(id) {
    if (confirm("Are you sure you want to delete this equipment?")) {
        $.ajax({
            url: `http://localhost:8080/Bootstrap_POS_Backend_Phase_02/api/v1/equipment/${id}`,
            method: "DELETE",
            success: () => {
                alert("Equipment deleted successfully!");
                loadEquipmentTable();
            },
            error: (xhr) => console.error("Failed to delete equipment:", xhr.status),
        });
    }
}

$(document).ready(() => {
    loadEquipmentTable();

    $("#equipmentId, #equipmentName, #equipmentType, #equipmentStatus, #staffDetails, #fieldDetails").on("keyup blur", checkEquipmentValidity);

    $("#saveEquipment").click(saveNewEquipment);
});
