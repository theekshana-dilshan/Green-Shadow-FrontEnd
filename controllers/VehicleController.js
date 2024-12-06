const vehicleCodeRegEx = /^VEHICLE-\d{4}$/;
const licensePlateRegEx = /^[A-Z0-9 ]{5,10}$/;
const vehicleCategoryRegEx = /^[A-Za-z ]{3,50}$/;
const fuelTypeRegEx = /^[A-Za-z ]+$/;
const statusRegEx = /^[A-Za-z ]+$/;
const staffMemberRegEx = /^STAFF-\d{4}$/;

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

document.addEventListener('DOMContentLoaded', () => {
    loadTable();
    VehicleIdGenerate();
});


// Attach event listener to the Update button in the modal
document.getElementById("updateVehicleBtn").addEventListener("click", function () {
    // Collect input values from the edit vehicle form
    const vehCode = $("#editVehicleCode").val();
    const vehPlatNum = $("#editLicensePlate").val();
    const vehCat = $("#editVehicleCategory").val();
    const vehFuel = $("#editFuelType").val();
    const vehStatus = $("#editVehicleStatus").val();
    const vehStaff = $("#editStaffMember").val();
    const vehRemark = $("#editRemarks").val();

    // Validate input fields
    if (!vehCode || !vehPlatNum || !vehCat || !vehFuel || !vehStatus || !vehStaff || !vehRemark) {
        alert("All fields are required!");
        return;
    }

    // Prepare data as a JavaScript object for the PUT request
    const vehicleData = {
        code: vehCode,
        licensePlateNum: vehPlatNum,
        category: vehCat,
        fuelType: vehFuel,
        status: vehStatus,
        remarks: vehRemark,
        staffId: vehStaff,
    };

    console.log("Updating Vehicle with Data:", vehicleData);

    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: `http://localhost:8080/api/v1/vehicle/${vehicleData.code}`,
        type: "PUT",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        data: JSON.stringify(vehicleData), // Convert the object to a JSON string
        success: function () {
            alert("Vehicle details updated successfully!");
            $("#viewVehicleModal").modal("hide");
            loadTable();
            VehicleIdGenerate();
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText || xhr.statusText);
            alert(`Failed to update vehicle details. Error: ${xhr.responseText || xhr.statusText}`);
        },
    });
});

function loadTable() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: "http://localhost:8080/api/v1/vehicle",
        type: "GET",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        success: (response) => {
            try {
                if (Array.isArray(response)) {
                    populateVehicleTable(response);
                } else {
                    console.error("Expected an array, but received:", response);
                    alert("Failed to load vehicle data. Invalid response format.");
                }
            } catch (error) {
                console.error("Error processing response:", error);
            }
        },
        error: (xhr, status, error) => {
            console.error("Error fetching vehicle data:", error);
            alert("Failed to load vehicle data. Please try again later.");
        }
    });
}

function populateVehicleTable(vehicleList) {
    try {
        const tableBody = $("#tblVehicle tbody");
        tableBody.empty();

        vehicleList.forEach((veh) => {
            const row = `
                <tr>
                    <td>${veh.vehicleCode || "N/A"}</td>
                    <td>${veh.licensePlateNum || "N/A"}</td>
                    <td>${veh.category || "N/A"}</td>
                    <td>${veh.fuelType || "N/A"}</td>
                    <td>${veh.status || "N/A"}</td>
                    <td>${veh.staff.id || "N/A"}</td>
                    <td>${veh.remarks || "N/A"}</td>
                    <td>
                        <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#viewVehicleModal" 
                            onclick="viewVehicleDetails('${veh.vehicleCode}')">
                            Update
                        </button>
                    </td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteVehicle('${veh.vehicleCode}')">Delete</button>
                    </td>
                </tr>
            `;
            tableBody.append(row);
        });
    } catch (e) {
        console.error("Error populating table:", e);
        alert("An error occurred while populating the table. Please try again.");
    }
}

function viewVehicleDetails(vehicleCode) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: `http://localhost:8080/api/v1/vehicle/${vehicleCode}`,
        type: "GET",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        success: (response) => {
            try {
                // Check if response contains the expected vehicle details
                if (response && response.vehicleCode === vehicleCode) {
                    // Populate the modal fields with the vehicle details
                    $("#editVehicleCode").val(response.vehicleCode || "N/A");
                    $("#editLicensePlate").val(response.licensePlateNum || "N/A");
                    $("#editVehicleCategory").val(response.category || "N/A");
                    $("#editFuelType").val(response.fuelType || "N/A");
                    $("#editVehicleStatus").val(response.status || "N/A");
                    $("#editStaffMember").val(response.staff.id || "N/A");
                    $("#editRemarks").val(response.remarks || "N/A");
                    
                    // Show the modal
                    $("#viewVehicleModal").modal("show");
                } else {
                    console.error("Vehicle data not found:", response);
                    alert("Failed to load vehicle details. Please try again.");
                }
            } catch (error) {
                console.error("Error processing vehicle details:", error);
                alert("An error occurred while loading vehicle details. Please try again.");
            }
        },
        error: (xhr, status, error) => {
            console.error("Error fetching vehicle details:", error);
            alert("Failed to fetch vehicle details. Please check your connection or try again later.");
        }
    });
}


function deleteVehicle(vehicleCode) {
    if (confirm("Are you sure you want to delete this vehicle?")) {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("No token found. Please log in.");
            return;
        }
        $.ajax({
            url: `http://localhost:8080/api/v1/vehicle/${vehicleCode}`,
            type: "DELETE",
            timeout: 0,
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + token
            },
            success: () => {
                alert("Vehicle deleted successfully!");
                loadTable();
            },
            error: (xhr, status, error) => {
                console.error("Error deleting vehicle:", error);
                alert("Failed to delete the vehicle. Please try again later.");
            }
        });
    }
}

// Call the function to load the table on page load or as needed
$(document).ready(() => {
    
});

function fetchStaff(staffId, callback) {
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
        success: callback,
        error: (error) => {
            console.error("Error loading staff:", error);
            alert("Failed to load staff data. Please try again.");
        },
    });
}

$("#saveVehicle").on("click", function () {
    const vehicleId = $("#vehicleCode").val();
    const licensePlateNumber = $("#licensePlate").val();
    const category = $("#vehicleCategory").val();
    const fuelType = $("#fuelType").val();
    const status = $("#status").val();
    const allocatedStaff = $("#staffMember").val();
    const remarks = $("#remarks").val();

    // Validate required fields
    if (!vehicleId || !licensePlateNumber || !category || !fuelType || !status) {
        alert("Please fill out all required fields.");
        return;
    }

    fetchStaff(allocatedStaff, (staff) => {
        const vehicleData = {
            vehicleCode: vehicleId,
            licensePlateNum: licensePlateNumber,
            category: category,
            fuelType: fuelType,
            status: status,
            remarks: remarks,
            staff: staff,
        };

        const token = localStorage.getItem("token");
        if (!token) {
            alert("No token found. Please log in.");
            return;
        }
        $.ajax({
            url: "http://localhost:8080/api/v1/vehicle", // Backend API endpoint
            type: "POST",
            timeout: 0,
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + token
            },
            data: JSON.stringify(vehicleData), 
            success: function (response) {
                console.log("Vehicle added successfully:", response);
                alert("Vehicle added successfully!");

                $("#addVehicleModal").modal("hide");

                loadTable();
                VehicleIdGenerate();
            },
            error: function (error) {
                console.error("Error adding vehicle:", error);
                alert("Failed to add vehicle. Please try again.");
            }
        });
    });
});


function VehicleIdGenerate() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: "http://localhost:8080/api/v1/vehicle",
        type: "GET",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        success: function (response) {
            if (Array.isArray(response) && response.length > 0) {
                response.sort((a, b) => a.vehicleCode.localeCompare(b.vehicleCode));

                const lastField = response[response.length - 1];

                if (lastField && lastField.vehicleCode) {
                    const lastFieldCode = lastField.vehicleCode;

                    const lastIdParts = lastFieldCode.split('-');
                    if (lastIdParts.length === 2 && !isNaN(lastIdParts[1])) {
                        const lastNumber = parseInt(lastIdParts[1], 10);

                        const nextId = `VEHICLE-${String(lastNumber + 1).padStart(4, '0')}`;
                        $("#vehicleCode").val(nextId);
                        return;
                    }
                }
            }
            $("#vehicleCode").val("VEHICLE-0001");
        },
        error: function (xhr, status, error) {
            console.error("Error fetching last vehicle ID:", error);
            alert("Unable to fetch the last vehicle ID. Using default ID.");
            $("#vehicleCode").val("VEHICLE-0001");
        }
    });
}

function deleteVehicle(vehicleCode) {
    if (confirm("Are you sure you want to delete this vehicle?")) {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("No token found. Please log in.");
            return;
        }
        $.ajax({
            url: `http://localhost:8080/api/v1/vehicle/${vehicleCode}`,
            method: "DELETE",
            timeout: 0,
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + token
            },
            success: () => {
                alert("Vehicle deleted successfully!");
                loadTable();
            },
            error: (xhr) => console.error("Failed to delete vehicle:", xhr.status),
        });
    }
}

$(document).ready(() => {
    $("#vehicleCode, #licensePlate, #vehicleCategory, #fuelType, #status, #staffMember").on("keyup blur", checkVehicleValidity);
});
