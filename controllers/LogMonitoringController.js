const logCodeRegEx = /^L[0-9]{3}$/;
const logDetailsRegEx = /^[A-Za-z0-9 ,.!?]{3,200}$/;
const logFieldRegEx = /^[A-Za-z0-9 ]+$/;
const logCropRegEx = /^[A-Za-z ]+$/;
const logStaffRegEx = /^[A-Za-z ]+$/;

let logValidations = [
    { reg: logCodeRegEx, field: $("#logCode"), error: "Log Code Pattern: L001" },
    { reg: logDetailsRegEx, field: $("#logDetails"), error: "Details: 3-200 alphanumeric characters" },
    { reg: logFieldRegEx, field: $("#logField"), error: "Field: Alphanumeric only" },
    { reg: logCropRegEx, field: $("#logCrop"), error: "Crop: Alphabetic only" },
    { reg: logStaffRegEx, field: $("#logStaff"), error: "Staff: Alphabetic only" },
];

function checkLogValidity() {
    let errorCount = 0;
    for (let validation of logValidations) {
        if (check(validation.reg, validation.field)) {
            setSuccess(validation.field, "");
        } else {
            errorCount++;
            setError(validation.field, validation.error);
        }
    }
    $("#saveLog").attr("disabled", errorCount > 0);
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

function loadLogTable() {
    $("#tblLog > tbody > tr").remove();

    $.ajax({
        url: "http://localhost:8080/api/v1/log",
        method: "GET",
        success: (logs) => {
            logs.forEach((log) => {
                let row = `
                    <tr>
                        <td>${log.logCode}</td>
                        <td>${log.logDate}</td>
                        <td>${log.logDetails}</td>
                        <td>${log.field}</td>
                        <td>${log.crop}</td>
                        <td>${log.staff}</td>
                        <td>
                            <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#viewLogModal" 
                                onclick="viewLogDetails('${log.logCode}')">View More</button>
                        </td>
                        <td>
                            <button class="btn btn-danger btn-sm" onclick="deleteLog('${log.logCode}')">Delete</button>
                        </td>
                    </tr>`;
                $("#tblLog tbody").append(row);
            });
        },
        error: (xhr) => console.error("Failed to load logs:", xhr.status),
    });
}

function viewLogDetails(logCode) {
    $.ajax({
        url: `http://localhost:8080/api/v1/log/${logCode}`,
        method: "GET",
        success: (log) => {
            // Populate the modal fields with log data
            $("#editLogCode").val(log.logCode);
            $("#editLogDate").val(log.logDate);
            $("#editLogDetails").val(log.logDetails);
            $("#editLogField").val(log.field);
            $("#editLogCrop").val(log.crop);
            $("#editLogStaff").val(log.staff);

            // Set the image source if available
            if (log.logImage) {
                $("#currentLogImage").attr("src", `data:image/png;base64,${log.logImage}`);
            } else {
                $("#currentLogImage").attr("src", "");
            }

            // Open the modal
            $("#viewLogModal").modal("show");
        },
        error: (xhr) => {
            console.error("Failed to fetch log details:", xhr.status);
            alert("Unable to fetch log details. Please try again.");
        },
    });
}

function deleteLog(logCode) {
    if (confirm(`Are you sure you want to delete the log with code: ${logCode}?`)) {
        $.ajax({
            url: `http://localhost:8080/api/v1/log/${logCode}`,
            method: "DELETE",
            success: () => {
                alert(`Log with code ${logCode} has been deleted.`);
                loadLogTable(); // Reload the table to reflect changes
            },
            error: (xhr) => {
                console.error("Failed to delete log:", xhr.status);
                alert("Unable to delete the log. Please try again.");
            },
        });
    }
}


$("#saveLog").on("click", function () {
    // Get values from input fields
    var logCode = $("#logCode").val();
    var logDate = $("#logDate").val();
    var logDetails = $("#logDetails").val();
    var logField = $("#logField").val();
    var logCrop = $("#logCrop").val();
    var logStaff = $("#logStaff").val();

    // Collect file input
    var logImage = $("#logImage")[0].files[0];

    // Validate required inputs
    if (!logCode || !logDate || !logDetails || !logField || !logCrop || !logStaff) {
        alert("Please fill out all required fields.");
        return;
    }

    if (!logImage) {
        alert("Please upload an observation image.");
        return;
    }

    // Create a FormData object for file upload
    var formData = new FormData();
    formData.append("logCode", logCode);
    formData.append("date", logDate);
    formData.append("observation", logDetails);
    formData.append("observationImage", logImage);
    formData.append("fieldCode", logField); // Ensure this matches your backend parameter
    formData.append("cropCode", logCrop); // Ensure this matches your backend parameter
    formData.append("staffId", logStaff);

    // Send AJAX POST request to the backend
    $.ajax({
        url: "http://localhost:5050/green/api/v1/mlog", // Backend endpoint
        type: "POST",
        processData: false,
        contentType: false,
        data: formData,
        success: (response) => {
            console.log("MonitorLog added successfully:", response);
            alert("MonitorLog added successfully!");
            clearLogFormFields();
            loadLogTable(); // Reload table to reflect the new entry
            $("#addLogModal").modal("hide"); // Close the modal
        },
        error: (xhr, status, error) => {
            console.error("Error adding MonitorLog:", xhr.responseText || error);
            if (xhr.responseText) {
                alert("Failed to add MonitorLog: " + xhr.responseText);
            } else {
                alert("Failed to add MonitorLog. Please try again.");
            }
        },
    });
});

document.getElementById("btnLogUpdate").addEventListener("click", function () {
    // Gather form values
    const logCode = $("#editLogCode").val();
    const logDate = $("#editLogDate").val();
    const logDetails = $("#editLogDetails").val();
    const logField = $("#editLogField").val();
    const logCrop = $("#editLogCrop").val();
    const logStaff = $("#editLogStaff").val();
    const logImage = $("#editLogImage")[0].files[0];

    // Validate required fields
    if (!logCode || !logDate || !logDetails || !logField || !logCrop || !logStaff) {
        alert("All fields are required!");
        return;
    }

    const formData = new FormData();
    formData.append("logCode", logCode);
    formData.append("date", logDate);
    formData.append("observation", logDetails);
    formData.append("fieldCode", logField);
    formData.append("cropCode", logCrop);
    formData.append("staffId", logStaff);

    if (logImage) {
        formData.append("observationImage", logImage);
    }

    // Send AJAX PUT request
    $.ajax({
        url: `http://localhost:5050/green/api/v1/mlog/${logCode}`,
        type: "PUT",
        processData: false,
        contentType: false,
        data: formData,
        success: function () {
            alert("Log details updated successfully!");
            $("#viewLogModal").modal("hide"); // Hide modal on success
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText || xhr.statusText);
            alert(`Failed to update log details. Error: ${xhr.responseText || xhr.statusText}`);
        },
    });
});


// Function to clear input fields
function clearLogFormFields() {
    $("#logCode").val("");
    $("#logDate").val("");
    $("#logDetails").val("");
    $("#logField").val("");
    $("#logCrop").val("");
    $("#logStaff").val("");
    $("#logImage").val("");
}



function deleteLog(code) {
    if (confirm("Are you sure you want to delete this log?")) {
        $.ajax({
            url: `http://localhost:8080/api/v1/log/${code}`,
            method: "DELETE",
            success: () => {
                alert("Log deleted successfully!");
                loadLogTable();
            },
            error: (xhr) => console.error("Failed to delete log:", xhr.status),
        });
    }
}

function LogIdGenerate() {
    $.ajax({
        url: "http://localhost:5050/green/api/v1/mlog", // API endpoint to fetch logs
        type: "GET",
        success: function (response) {
            try {
                // Validate response as an array
                if (Array.isArray(response) && response.length > 0) {
                    // Sort by logCode in ascending order
                    response.sort((a, b) => a.logCode.localeCompare(b.logCode));

                    // Get the last log from the sorted array
                    const lastLog = response[response.length - 1];

                    // Check if logCode exists and follows the expected format
                    if (lastLog && lastLog.logCode) {
                        const lastLogCode = lastLog.logCode;

                        // Split the logCode by '-' and extract the numeric part
                        const logParts = lastLogCode.split('-');
                        if (logParts.length === 2 && !isNaN(logParts[1])) {
                            const lastNumber = parseInt(logParts[1], 10);

                            // Generate the next ID
                            const nextId = `LOG-${String(lastNumber + 1).padStart(4, '0')}`;
                            $("#logCode").val(nextId);
                            return; // Successfully generated ID
                        }
                    }
                }

                // If response is empty or logCode is invalid, set default ID
                $("#logCode").val("LOG-0001");
            } catch (error) {
                console.error("Error processing response:", error);
                $("#logCode").val("LOG-0001"); // Fallback to default ID
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching last log ID:", error);
            alert("Unable to fetch the last log ID. Using default ID.");
            $("#logCode").val("LOG-0001"); // Fallback to default ID
        }
    });
}

LogIdGenerate();

$(document).ready(() => {
    loadLogTable();

    $("#logCode, #logDetails, #logField, #logCrop, #logStaff").on("keyup blur", checkLogValidity);
});

function extractImageData(input) {
    const file = input.files[0];
    if (file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    }
    return Promise.resolve(null); // No image uploaded
}
