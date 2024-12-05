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

    // Make the PUT request using the JSON data
    $.ajax({
        url: `http://localhost:8080/api/v1/vehicle/${vehicleData.code}`,
        type: "PUT",
        contentType: "application/json",  // Indicating the content type is JSON
        data: JSON.stringify(vehicleData), // Convert the object to a JSON string
        success: function () {
            alert("Vehicle details updated successfully!");
            // Hide the modal after successful update
            $("#viewVehicleModal").modal("hide");
            // Optionally, refresh the table or UI to reflect changes
            location.reload();
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText || xhr.statusText);
            alert(`Failed to update vehicle details. Error: ${xhr.responseText || xhr.statusText}`);
        },
    });
});


function loadTable() {
    // Fetch data from the backend API
    $.ajax({
        url: "http://localhost:8080/api/v1/vehicle",
        type: "GET",
        contentType: "application/json",
        success: (response) => {
            try {
                if (Array.isArray(response)) {
                    populateVehicleTable(response); // Pass the response to populate the table
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
        const tableBody = $(".table-responsive tbody");
        tableBody.empty(); // Clear existing rows

        // Loop through each vehicle object and create table rows
        vehicleList.forEach((veh) => {
            const row = `
                <tr>
                    <td>${veh.code || "N/A"}</td>
                    <td>${veh.licensePlateNum || "N/A"}</td>
                    <td>${veh.category || "N/A"}</td>
                    <td>${veh.fuelType || "N/A"}</td>
                    <td>${veh.status || "N/A"}</td>
                    <td>${veh.staffName || "N/A"}</td>
                    <td>${veh.remarks || "N/A"}</td>
                    <td>
                        <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#viewVehicleModal" 
                            onclick="viewVehicleDetails('${veh.code}')">
                            Update
                        </button>
                    </td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteVehicle('${veh.code}')">Delete</button>
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
    // Fetch the vehicle details from the backend using the vehicle code
    $.ajax({
        url: `http://localhost:8080/api/v1/vehicle/${vehicleCode}`,
        type: "GET",
        contentType: "application/json",
        success: (response) => {
            try {
                // Check if response contains the expected vehicle details
                if (response && response.code === vehicleCode) {
                    // Populate the modal fields with the vehicle details
                    $("#editVehicleCode").val(response.code || "N/A");
                    $("#editLicensePlate").val(response.licensePlateNum || "N/A");
                    $("#editVehicleCategory").val(response.category || "N/A");
                    $("#editFuelType").val(response.fuelType || "N/A");
                    $("#editVehicleStatus").val(response.status || "N/A");
                    $("#editStaffMember").val(response.staffName || "N/A");
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


function deleteVehicle(code) {
    if (confirm("Are you sure you want to delete this vehicle?")) {
        $.ajax({
            url: `http://localhost:8080/api/v1/vehicle/${code}`,
            type: "DELETE",
            success: () => {
                alert("Vehicle deleted successfully!");
                loadTable(); // Refresh table after deletion
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
    loadTable();
});


$("#saveVehicle").on("click", function () {
    // Get values from the input fields in the Add Vehicle Modal
    const code = $("#vehicleCode").val();
    const liPlateNum = $("#licensePlate").val();
    const vehCat = $("#vehicleCategory").val();
    const fuelType = $("#fuelType").val();
    const status = $("#status").val();
    const staff = $("#staffMember").val(); // Staff ID or name based on your system
    const remarks = $("#remarks").val();

    // Validate required fields
    if (!code || !liPlateNum || !vehCat || !fuelType || !status || !staff) {
        alert("Please fill out all required fields.");
        return;
    }

    // Create a JSON object for vehicle data
    const vehicleData = {
        code: code,
        licensePlateNum: liPlateNum,
        category: vehCat,
        fuelType: fuelType,
        status: status,
        remarks: remarks,
        staffId: staff, // Adjust field name as needed
    };

    // Send an AJAX POST request with JSON payload
    $.ajax({
        url: "http://localhost:8080/api/v1/vehicle", // Backend API endpoint
        type: "POST",
        contentType: "application/json", // Send JSON data
        data: JSON.stringify(vehicleData), // Convert the vehicle data to JSON string
        success: function (response) {
            console.log("Vehicle added successfully:", response);
            alert("Vehicle added successfully!");

            // Clear the form fields and close the modal
            $("#addVehicleForm")[0].reset();
            $("#addVehicleModal").modal("hide");

            // Optionally, refresh the vehicle table to show the new vehicle
            loadTable();
        },
        error: function (error) {
            console.error("Error adding vehicle:", error);
            alert("Failed to add vehicle. Please try again.");
        }
    });
});


function VehicleIdGenerate() {
    $.ajax({
        url: "http://localhost:8080/api/v1/vehicle", // API endpoint to fetch fields
        type: "GET",
        success: function (response) {
            // Validate the response is an array
            if (Array.isArray(response) && response.length > 0) {
                // Sort the array by fieldCode in ascending order (if necessary)
                response.sort((a, b) => a.code.localeCompare(b.code));

                // Get the last field in the sorted array
                const lastField = response[response.length - 1];

                // Validate that fieldCode exists and follows the expected format
                if (lastField && lastField.code) {
                    const lastFieldCode = lastField.code;

                    // Split the fieldCode using '-' and extract the numeric part
                    const lastIdParts = lastFieldCode.split('-');
                    if (lastIdParts.length === 2 && !isNaN(lastIdParts[1])) {
                        const lastNumber = parseInt(lastIdParts[1], 10);

                        // Generate the next ID
                        const nextId = `VEH-${String(lastNumber + 1).padStart(4, '0')}`;
                        $("#vehicleCode").val(nextId);
                        return;
                    }
                }
            }

            // If response is empty or no valid fieldCode found, set default value
            $("#vehicleCode").val("VEH-0001");
        },
        error: function (xhr, status, error) {
            console.error("Error fetching last Field ID:", error);
            alert("Unable to fetch the last Field ID. Using default ID.");
            $("#vehicleCode").val("FIELD-0001"); // Set default ID in case of error
        }
    });
}

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
