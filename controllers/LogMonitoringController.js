const logCodeRegEx = /^LOG-\d{4}$/;
const logDetailsRegEx = /^[A-Za-z0-9 ,.!?]{3,200}$/;

let logValidations = [
    { reg: logCodeRegEx, field: $("#logCode"), error: "Log Code Pattern: L001" },
    { reg: logDetailsRegEx, field: $("#logDetails"), error: "Details: 3-200 alphanumeric characters" }
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

    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: "http://localhost:8080/api/v1/logs",
        method: "GET",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        success: (logs) => {
            logs.forEach((log) => {
                let row = `
                    <tr>
                        <td>${log.logCode}</td>
                        <td>${log.date}</td>
                        <td>${log.observation}</td>
                        <td>${log.fieldDTO}</td>
                        <td>${log.staffDTO}</td>
                        <td>${log.cropDTO}</td>
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
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: `http://localhost:8080/api/v1/logs/${logCode}`,
        method: "GET",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        success: (log) => {
            // Populate the modal fields with log data
            $("#editLogCode").val(log.logCode);
            $("#editLogDate").val(log.date);
            $("#editLogDetails").val(log.observation);
            $("#editLogField").val(log.fieldDTO);
            $("#editLogCrop").val(log.staffDTO);
            $("#editLogStaff").val(log.cropDTO);

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
        const token = localStorage.getItem("token");
        if (!token) {
            alert("No token found. Please log in.");
            return;
        }
        $.ajax({
            url: `http://localhost:8080/api/v1/logs/${logCode}`,
            method: "DELETE",
            timeout: 0,
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + token
            },
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


$("#saveLog").on("click", async function () {
    const logCode = $("#logsCode").val();
    const logDate = $("#logDate").val();
    const observation = $("#logDetails").val();
    const relevantFields = $("#logField").val();
    const relevantCrops = $("#logCrop").val();
    const staffMember = $("#logStaff").val();
    const observedImage = $("#logImage")[0].files[0];

    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }

    const fetchData = async (url) => {
        try {
            const response = await $.ajax({
                url,
                method: "GET",
                timeout: 0,
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': 'Bearer ' + token,
                },
            });
            return response;
        } catch (error) {
            if (error.status === 403) {
                alert("Access Denied: You do not have permission to perform this action.");
            } else {
                console.error(`Error fetching data from ${url}:`, error);
                alert("Failed to load data. Please try again later.");
            }
            return null;
        }
    };

    // Fetch related data
    let newFieldDTO = null;
    let newCropDTO = null;
    let newStaffDTO = null;

    if (relevantFields) {
        newFieldDTO = await fetchData(`http://localhost:8080/api/v1/field/${relevantFields}`);
    }

    if (relevantCrops) {
        newCropDTO = await fetchData(`http://localhost:8080/api/v1/crop/${relevantCrops}`);
    }

    if (staffMember) {
        newStaffDTO = await fetchData(`http://localhost:8080/api/v1/staff/${staffMember}`);
    }

    // Read image as Base64
    const readImageAsBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };

    let base64Image = null;
    if (observedImage) {
        try {
            base64Image = await readImageAsBase64(observedImage);
        } catch (error) {
            console.error("Error reading image file:", error);
            alert("Failed to process image. Please try again.");
            return;
        }
    }

    // Construct request data
    const requestData = {
        logCode: logCode,
        date: logDate,
        observation: observation,
        observationImage: base64Image,
        fieldDTO: newFieldDTO,
        staffDTO: newStaffDTO,
        cropDTO: newCropDTO,
    };

    console.log("Request data:", requestData);

    // Save log data
    try {
        const response = await $.ajax({
            url: "http://localhost:8080/api/v1/logs",
            method: "POST",
            timeout: 0,
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + token,
            },
            data: JSON.stringify(requestData),
        });

        console.log("Log saved successfully:", response);
        alert("Log saved successfully!");
        loadLogTable();
    } catch (error) {
        console.error("Error saving log:", error);
        alert("Failed to save log. Please try again.");
    }
});



document.getElementById("btnLogUpdate").addEventListener("click", function () {
    // Gather form values
    const logCode = $("#editLogCode").val();
    const logDate = $("#editLogDate").val();
    const logDetails = $("#editLogDetails").val();
    const logField = $("#editLogField").val();
    const logCrop = $("#editLogCrop").val();
    const logStaff = $("#editLogStaff").val();
    const logImage = $("#editLogImage")[0].files[0]; // New image file
    const existingImageBase64 = $("#imageUpdateLogView img").attr("src"); // Existing Base64 image

    // Validate required fields
    if (!logCode || !logDate || !logDetails || !logField || !logCrop || !logStaff) {
        alert("All fields are required!");
        return;
    }

    // Convert the uploaded file or use the existing Base64
    const convertImageToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve(null); // No new image provided
                return;
            }
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(",")[1]); // Extract Base64 part
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };

    const processImage = logImage
        ? convertImageToBase64(logImage) // Convert new file
        : Promise.resolve(existingImageBase64 ? existingImageBase64.split(",")[1] : null); // Use existing Base64 or null

    processImage
        .then((base64Image) => {
            // Prepare JSON payload
            const updateLogDTO = {
                logCode: logCode,
                date: logDate,
                observation: logDetails,
                fieldCode: logField,
                cropCode: logCrop,
                staffId: logStaff,
                observationImage: base64Image, // Base64 image string or null
            };

            const token = localStorage.getItem("token");
            if (!token) {
                alert("No token found. Please log in.");
                return;
            }
            $.ajax({
                url: `http://localhost:8080/api/v1/logs/${logCode}`,
                type: "PUT",
                timeout: 0,
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': 'Bearer ' + token
                },
                data: JSON.stringify(updateLogDTO),
                success: function () {
                    alert("Log details updated successfully!");
                    $("#viewLogModal").modal("hide"); // Hide modal on success
                },
                error: function (xhr) {
                    console.error("Error:", xhr.responseText || xhr.statusText);
                    alert(`Failed to update log details. Error: ${xhr.responseText || xhr.statusText}`);
                },
            });
        })
        .catch((error) => {
            console.error("Error converting image to Base64:", error);
            alert("Failed to process the image. Please try again.");
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

function LogIdGenerate() {
    console.log("Generating log id");
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: "http://localhost:8080/api/v1/logs",
        type: "GET",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        success: function (response) {
            try {
                if (Array.isArray(response) && response.length > 0) {
                    response.sort((a, b) => a.logCode.localeCompare(b.logCode));

                    const lastLog = response[response.length - 1];

                    if (lastLog && lastLog.logCode) {
                        const lastLogCode = lastLog.logCode;

                        const logParts = lastLogCode.split('-');
                        if (logParts.length === 2 && !isNaN(logParts[1])) {
                            const lastNumber = parseInt(logParts[1], 10);

                            const nextId = `LOG-${String(lastNumber + 1).padStart(4, '0')}`;
                            $("#logsCode").val(nextId);
                            console.log(nextId);
                            return;
                        }
                    }
                }
                console.log("ERROR");
                $("#logsCode").val("LOG-0001");
            } catch (error) {
                console.error("Error processing response:", error);
                $("#logsCode").val("LOG-0001");
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching last log ID:", error);
            alert("Unable to fetch the last log ID. Using default ID.");
            $("#logCode").val("LOG-0001");
        }
    });
}

LogIdGenerate();

$(document).ready(() => {
    loadLogTable();
    LogIdGenerate(); 

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


document.addEventListener('DOMContentLoaded', () => {
    LogIdGenerate();
});
