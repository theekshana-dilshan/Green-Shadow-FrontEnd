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
                                onclick="populateLogDetails('${log.logCode}', '${log.logDate}', '${log.logDetails}', '${log.image}', '${log.field}', '${log.crop}', '${log.staff}')">View More</button>
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

function populateLogDetails(code, date, details, image, field, crop, staff) {
    $("#editLogCode").val(code);
    $("#editLogDate").val(date);
    $("#editLogDetails").val(details);
    $("#editLogImage").val('');
    $("#currentLogImage").attr("src", image || "");
    $("#editLogField").val(field);
    $("#editLogCrop").val(crop);
    $("#editLogStaff").val(staff);
}

$("#saveLog").click(async () => {
    try {
        const imageData = await extractImageData($("#logImage")[0]);

        const newLog = {
            logCode: $("#logCode").val(),
            logDate: $("#logDate").val(),
            logDetails: $("#logDetails").val(),
            image: imageData,
            field: $("#logField").val(),
            crop: $("#logCrop").val(),
            staff: $("#logStaff").val(),
        };

        $.ajax({
            url: "http://localhost:8080/api/v1/log",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(newLog),
            success: () => {
                alert("Log saved successfully!");
                $("#addLogModal").modal("hide");
                loadLogTable();
            },
            error: (xhr) => console.error("Failed to save log:", xhr.status),
        });
    } catch (error) {
        console.error("Image processing error:", error);
    }
});

function saveLogDetails() {
    extractImageData($("#editLogImage")[0]).then((imageData) => {
        const updatedLog = {
            logCode: $("#editLogCode").val(),
            logDate: $("#editLogDate").val(),
            logDetails: $("#editLogDetails").val(),
            image: imageData,
            field: $("#editLogField").val(),
            crop: $("#editLogCrop").val(),
            staff: $("#editLogStaff").val(),
        };

        $.ajax({
            url: `http://localhost:8080/api/v1/log/${updatedLog.logCode}`,
            method: "PATCH",
            contentType: "application/json",
            data: JSON.stringify(updatedLog),
            success: () => {
                alert("Log updated successfully!");
                $("#viewLogModal").modal("hide");
                loadLogTable();
            },
            error: (xhr) => console.error("Failed to update log:", xhr.status),
        });
    }).catch((error) => {
        console.error("Image processing error:", error);
    });
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
