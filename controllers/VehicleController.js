const vehicleCodeRegEx = /^V[0-9]{3}$/;
const licensePlateRegEx = /^[A-Z0-9 ]{5,10}$/;
const vehicleCategoryRegEx = /^[A-Za-z ]{3,50}$/;
const fuelTypeRegEx = /^[A-Za-z ]+$/;
const statusRegEx = /^[A-Za-z ]+$/;
const staffMemberRegEx = /^[A-Za-z ]{3,50}$/;

let vehicleValidations = [
    { reg: vehicleCodeRegEx, field: $("#vehicleCode"), error: "Vehicle Code Pattern: V001" },
    { reg: licensePlateRegEx, field: $("#licensePlate"), error: "License Plate: 5-10 characters" },
    { reg: vehicleCategoryRegEx, field: $("#vehicleCategory"), error: "Category: 3-50 letters" },
    { reg: fuelTypeRegEx, field: $("#fuelType"), error: "Fuel Type: Alphabetic only" },
    { reg: statusRegEx, field: $("#status"), error: "Status: Alphabetic only" },
    { reg: staffMemberRegEx, field: $("#staffMember"), error: "Staff: 3-50 letters" },
];

function checkVehicleValidity() {
    let errorCount = 0;
    for (let validation of vehicleValidations) {
        if (check(validation.reg, validation.field)) {
            setSuccess(validation.field, "");
        } else {
            errorCount++;
            setError(validation.field, validation.error);
        }
    }
    $("#saveVehicle").attr("disabled", errorCount > 0);
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

function loadVehicleTable() {
    $("#tblVehicle > tbody > tr").remove();

    $.ajax({
        url: "http://localhost:8080/api/v1/vehicle",
        method: "GET",
        success: (vehicles) => {
            vehicles.forEach((vehicle) => {
                let row = `
                    <tr>
                        <td>${vehicle.vehicleCode}</td>
                        <td>${vehicle.licensePlate}</td>
                        <td>${vehicle.category}</td>
                        <td>${vehicle.fuelType}</td>
                        <td>${vehicle.status}</td>
                        <td>${vehicle.staffMember}</td>
                        <td>${vehicle.remarks || "N/A"}</td>
                        <td>
                            <button class="btn btn-danger btn-sm" onclick="deleteVehicle('${vehicle.vehicleCode}')">Delete</button>
                        </td>
                    </tr>`;
                $("#tblVehicle tbody").append(row);
            });
        },
        error: (xhr) => console.error("Failed to load vehicles:", xhr.status),
    });
}

$("#saveVehicle").click(() => {
    const newVehicle = {
        vehicleCode: $("#vehicleCode").val(),
        licensePlate: $("#licensePlate").val(),
        category: $("#vehicleCategory").val(),
        fuelType: $("#fuelType").val(),
        status: $("#status").val(),
        staffMember: $("#staffMember").val(),
        remarks: $("#remarks").val(),
    };

    $.ajax({
        url: "http://localhost:8080/api/v1/vehicle",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(newVehicle),
        success: () => {
            alert("Vehicle saved successfully!");
            $("#addVehicleModal").modal("hide");
            loadVehicleTable();
        },
        error: (xhr) => console.error("Failed to save vehicle:", xhr.status),
    });
});

function deleteVehicle(code) {
    if (confirm("Are you sure you want to delete this vehicle?")) {
        $.ajax({
            url: `http://localhost:8080/api/v1/vehicle/${code}`,
            method: "DELETE",
            success: () => {
                alert("Vehicle deleted successfully!");
                loadVehicleTable();
            },
            error: (xhr) => console.error("Failed to delete vehicle:", xhr.status),
        });
    }
}

$(document).ready(() => {
    loadVehicleTable();

    $("#vehicleCode, #licensePlate, #vehicleCategory, #fuelType, #status, #staffMember").on("keyup blur", checkVehicleValidity);
});
