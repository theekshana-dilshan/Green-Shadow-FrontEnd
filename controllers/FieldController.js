const fieldCodeRegEx = /^F[0-9]{3}$/;
const fieldNameRegEx = /^[A-Za-z ]{3,50}$/;
const fieldLocationRegEx = /^[A-Za-z0-9, ]{3,100}$/;
const fieldSizeRegEx = /^[0-9]+(\.[0-9]+)? Acres$/;
const fieldCropRegEx = /^[A-Za-z, ]+$/;
const fieldStaffRegEx = /^[A-Za-z ]+$/;

let fieldValidations = [
    { reg: fieldCodeRegEx, field: $("#fieldCode"), error: "Field Code Pattern: F001" },
    { reg: fieldNameRegEx, field: $("#fieldName"), error: "Field Name: 3-50 letters" },
    { reg: fieldLocationRegEx, field: $("#fieldLocation"), error: "Field Location: Alphanumeric, comma, and space allowed" },
    { reg: fieldSizeRegEx, field: $("#fieldSize"), error: "Field Size: Must be a valid number with 'Acres'" },
    { reg: fieldCropRegEx, field: $("#fieldCrops"), error: "Crops: Alphabetic and comma-separated" },
    { reg: fieldStaffRegEx, field: $("#fieldStaff"), error: "Staff: Alphabetic only" },
];

function checkFieldValidity() {
    let errorCount = 0;
    for (let validation of fieldValidations) {
        if (check(validation.reg, validation.field)) {
            setSuccess(validation.field, "");
        } else {
            errorCount++;
            setError(validation.field, validation.error);
        }
    }
    $("#saveField").attr("disabled", errorCount > 0);
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

function displaySelectedImage(event) {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Create an image element and set its src to the selected file's data
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = "100%"; // Adjust size as needed
            img.style.height = "auto"; // Maintain aspect ratio
            img.style.borderRadius = "8px"; // Optional: Style the image

            // Clear previous content in the div and append the new image
            const imageUpdateView = document.getElementById('field_imageUpdateView');
            imageUpdateView.innerHTML = '';
            imageUpdateView.appendChild(img);
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    }
}

function clearFields() {
    $("#fieldCode").val('');         
    $("#fieldName").val('');        
    $("#sizeOfTheField").val('');         
    $("#cropDetails").val('');           
    $("#staffDetails").val('');           
    $("#fieldImage").val('');           
    $("#currentFieldImage1").attr("src", ""); 
}


fieldIdGenerate();
function fieldIdGenerate() {
    $.ajax({
        url: "http://localhost:5050/green/api/v1/field",
        type: "GET",
        success: function (response) {
            // Validate the response is an array
            if (Array.isArray(response) && response.length > 0) {
                // Sort the array by fieldCode in ascending order (if necessary)
                response.sort((a, b) => a.fieldCode.localeCompare(b.fieldCode));

                // Get the last field in the sorted array
                const lastField = response[response.length - 1];

                // Validate that fieldCode exists and follows the expected format
                if (lastField && lastField.fieldCode) {
                    const lastFieldCode = lastField.fieldCode;

                    // Split the fieldCode using '-' and extract the numeric part
                    const lastIdParts = lastFieldCode.split('-');
                    if (lastIdParts.length === 2 && !isNaN(lastIdParts[1])) {
                        const lastNumber = parseInt(lastIdParts[1], 10);

                        // Generate the next ID
                        const nextId = `FIELD-${String(lastNumber + 1).padStart(4, '0')}`;
                        $("#fieldCode").val(nextId); // Set the next field code in the form
                        return;
                    }
                }
            }

            // If response is empty or no valid fieldCode found, set default value
            $("#fieldCode").val("FIELD-0001");
        },
        error: function (xhr, status, error) {
            console.error("Error fetching last Field ID:", error);
            alert("Unable to fetch the last Field ID. Using default ID.");
            $("#fieldCode").val("FIELD-0001"); // Set default ID in case of error
        }
    });
}


function loadFieldTable() {
    $("#tblField > tbody > tr").remove();

    $.ajax({
        url: "http://localhost:8080/Bootstrap_POS_Backend_Phase_02/api/v1/field",
        method: "GET",
        success: (fields) => {
            fields.forEach((field) => {
                let row = `
                    <tr>
                        <td>${field.fieldCode}</td>
                        <td>${field.fieldName}</td>
                        <td>${field.location}</td>
                        <td>${field.size}</td>
                        <td>
                            <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#viewFieldModal" onclick="editField('${item.fieldCode}')">View More</button>
                        </td>
                        <td>
                            <button class="btn btn-danger btn-sm" onclick="deleteField('${item.fieldCode}')">Delete</button>
                        </td>
                    </tr>`;
                $("#tblField tbody").append(row);
            });
        },
        error: (xhr) => console.error("Failed to load fields:", xhr.status),
    });
}


$("#saveField").on('click', function() {
    var fieldCode = $("#fieldCode").val();
    var fieldName = $("#fieldName").val();
    var fieldSize = $("#sizeOfTheField").val();
    var fieldCrops = $("#cropDetails").val();
    var fieldStaff = $("#staffDetails").val();

    var fieldImage = $("#fieldImage")[0].files[0];

    var formData = new FormData();
    formData.append("fieldCode", fieldCode);
    formData.append("fieldName", fieldName);
    formData.append("fieldSize", fieldSize);
    formData.append("crops", fieldCrops);
    formData.append("staff", fieldStaff);
    formData.append("fieldImage1", fieldImage);

    $.ajax({
        url: "http://localhost:8080/Bootstrap_POS_Backend_Phase_02/api/v1/field",
        type: "POST",
        processData: false,
        contentType: false,
        data: formData,
        success: (response) => {
            console.log("Field added successfully:", response);
            alert("Field added successfully!");
            clearFieldForm();
            loadFieldTable();
        },
        error: (error) => {
            console.error("Error adding field:", error);
            alert("Failed to add field. Please try again.");
        }
    });
});

function clearFieldForm() {
    $("#fieldCode").val('');
    $("#fieldName").val('');
    $("#sizeOfTheField").val('');
    $("#cropDetails").val('');
    $("#staffDetails").val('');
    $("#fieldImage").val('');
    $("#fieldImage2").val('');
}


function saveFieldDetails() {
    extractFieldImages().then(({ image1, image2 }) => {
        const updatedField = {
            fieldCode: $("#editFieldCode").val(),
            fieldName: $("#editFieldName").val(),
            location: $("#editFieldLocation").val(),
            size: $("#editFieldSize").val(),
            crops: $("#editFieldCrops").val(),
            staff: $("#editFieldStaff").val(),
            image1: image1,
            image2: image2,
        };

        $.ajax({
            url: `http://localhost:8080/Bootstrap_POS_Backend_Phase_02/api/v1/field/${updatedField.fieldCode}`,
            method: "PATCH",
            contentType: "application/json",
            data: JSON.stringify(updatedField),
            success: () => {
                alert("Field updated successfully!");
                $("#viewFieldModal").modal("hide");
                loadFieldTable();
            },
            error: (xhr) => console.error("Failed to update field:", xhr.status),
        });
    }).catch((error) => {
        console.error("Image processing error:", error);
    });
}

document.getElementById("editFieldImage").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imageData = e.target.result;
            $("#imageUpdateFieldView").html(
                `<img src="${imageData}" alt="Updated Crop Image" style="width: 100px; height: 80px;">`
            );
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById("fieldUpdateBtn").addEventListener("click", function () {
    // Get values from the modal inputs
    const fieldCode = $("#editFieldCode").val();
    const fieldName = $("#editFieldName").val();
    const fieldLocation = $("#editFieldLocation").val();
    const fieldSize = $("#editFieldSize").val();
    const fieldCrops = $("#editFieldCrops").val();
    const fieldStaff = $("#editFieldStaff").val();
    const fieldImageFile = $("#editFieldImage")[0].files[0];
    const existingImageBase64 = $("#imageUpdateFieldView img").attr("src");

    // Validate required fields
    if (!fieldCode || !fieldName || !fieldLocation || !fieldSize || !fieldCrops || !fieldStaff) {
        alert("All fields are required!");
        return;
    }

    // Convert the uploaded file or use the existing base64
    if (fieldImageFile) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const base64Image = event.target.result.split(",")[1]; // Extract base64 without prefix
            sendUpdateRequest(fieldCode, fieldName, fieldLocation, fieldSize, fieldCrops, fieldStaff, base64Image);
        };
        reader.readAsDataURL(fieldImageFile);
    } else if (existingImageBase64) {
        const base64Image = existingImageBase64.split(",")[1]; // Extract base64 without prefix
        sendUpdateRequest(fieldCode, fieldName, fieldLocation, fieldSize, fieldCrops, fieldStaff, base64Image);
    } else {
        alert("Please upload or select an image!");
        return;
    }
});

function sendUpdateRequest(fieldCode, fieldName, fieldLocation, fieldSize, fieldCrops, fieldStaff, base64Image) {
    const updateFieldDTO = {
        fieldCode: fieldCode,
        fieldName: fieldName,
        fieldLocation: fieldLocation,
        fieldSize: fieldSize,
        fieldCrops: fieldCrops, // Add crops information
        fieldStaff: fieldStaff, // Add staff information
        fieldImage: base64Image, // Include base64 image in JSON payload
    };

    $.ajax({
        url: `http://localhost:5050/green/api/v1/field/${fieldCode}`,
        type: "PUT",
        contentType: "application/json", // Send JSON data
        data: JSON.stringify(updateFieldDTO),
        success: function () {
            alert("Field updated successfully!");
            loadTable(); // Function to reload the field table after update
            $('#viewFieldModal').modal('hide'); // Close the modal
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText || xhr.statusText);
            alert(`Failed to update field details. Error: ${xhr.responseText || xhr.statusText}`);
        },
    });
}


function editField(fieldCode) {
    $.ajax({
        url: `http://localhost:8080/Bootstrap_POS_Backend_Phase_02/api/v1/field/${fieldCode}`, 
        method: "GET",
        success: (field) => {
            $("#editFieldCode").val(field.fieldCode);
            $("#editFieldName").val(field.fieldName);
            $("#editFieldLocation").val(field.location);
            $("#editFieldSize").val(field.size);
            $("#editFieldCrops").val(field.crops);
            $("#editFieldStaff").val(field.staff);

            if (field.fieldImage1) {
                $("#currentFieldImage1").attr("src", `http://localhost:8080/images/${field.fieldImage1}`);
            } else {
                $("#currentFieldImage1").attr("src", ""); 
            }
        },
        error: (xhr) => {
            console.error("Failed to load field data:", xhr.status);
            alert("Failed to load field data. Please try again.");
        }
    });
}


function deleteField(code) {
    if (confirm("Are you sure you want to delete this field?")) {
        $.ajax({
            url: `http://localhost:8080/Bootstrap_POS_Backend_Phase_02/api/v1/field/${code}`,
            method: "DELETE",
            success: () => {
                alert("Field deleted successfully!");
                loadFieldTable();
            },
            error: (xhr) => console.error("Failed to delete field:", xhr.status),
        });
    }
}
