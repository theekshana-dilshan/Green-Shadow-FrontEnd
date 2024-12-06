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
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = "100%"; 
            img.style.height = "auto";
            img.style.borderRadius = "8px"; 

            const imageUpdateView = document.getElementById('field_imageUpdateView');
            imageUpdateView.innerHTML = '';
            imageUpdateView.appendChild(img);
        };
        reader.readAsDataURL(file); 
    }
}

function clearFields() {
    fieldIdGenerate();        
    $("#fieldName").val(''); 
    $("#fieldLocation").val('');       
    $("#sizeOfTheField").val('');         
    $("#cropDetails").val('');           
    $("#staffDetails").val('');           
    $("#fieldImage").val('');           
    $("#currentFieldImage1").attr("src", ""); 
}


fieldIdGenerate();
function fieldIdGenerate() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: "http://localhost:8080/api/v1/field",
        type: "GET",
        timeout: 0,
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function (response) {
            if (Array.isArray(response) && response.length > 0) {
                response.sort((a, b) => a.fieldCode.localeCompare(b.fieldCode));

                const lastField = response[response.length - 1];

                if (lastField && lastField.fieldCode) {
                    const lastFieldCode = lastField.fieldCode;

                    const lastIdParts = lastFieldCode.split('-');
                    if (lastIdParts.length === 2 && !isNaN(lastIdParts[1])) {
                        const lastNumber = parseInt(lastIdParts[1], 10);

                        const nextId = `FIELD-${String(lastNumber + 1).padStart(4, '0')}`;
                        $("#fieldCode").val(nextId);
                        return;
                    }
                }
            }

            $("#fieldCode").val("FIELD-0001");
        },
        error: function (xhr, status, error) {
            console.error("Error fetching last Field ID:", error);
            alert("Unable to fetch the last Field ID. Using default ID.");
            $("#fieldCode").val("FIELD-0001");
        }
    });
}

loadFieldTable();
function loadFieldTable() {
    $("#tblField > tbody > tr").remove();

    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: "http://localhost:8080/api/v1/field",
        method: "GET",
        timeout: 0,
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: (fields) => {
            fields.forEach((field) => {
                let row = `
                    <tr>
                        <td>${field.fieldCode}</td>
                        <td>${field.fieldName}</td>
                        <td>${field.fieldLocation}</td>
                        <td>${field.fieldSize}</td>
                        <td>
                            <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#viewFieldModal" onclick="editField('${field.fieldCode}')">View More</button>
                        </td>
                        <td>
                            <button class="btn btn-danger btn-sm" onclick="deleteField('${field.fieldCode}')">Delete</button>
                        </td>
                    </tr>`;
                $("#tblField tbody").append(row);
            });
        },
        error: (xhr) => console.error("Failed to load fields:", xhr.status),
    });
}


$("#saveField").on("click", function () {
    const fieldCode = $("#fieldCode").val();
    const fieldName = $("#fieldName").val();
    const fieldLocation = $("#fieldLocation").val();
    const fieldSize = $("#sizeOfTheField").val();
    const fieldCrops = $("#cropDetails").val();
    const fieldStaff = $("#staffDetails").val();
    const fieldImageFile = $("#fieldImage")[0].files[0];

    
    if (!fieldCode || !fieldName || !fieldSize) {
        alert("All fields are required.");
        return;
    }

    // Convert image to Base64
    const convertImageToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve(null); // No image provided
                return;
            }
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(",")[1]); // Extract base64 part
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };

    convertImageToBase64(fieldImageFile)
        .then((fieldImage) => {
            const fieldData = {
                fieldCode: fieldCode,
                fieldName: fieldName,
                fieldLocation: fieldLocation,
                fieldSize: fieldSize,
                crops: fieldCrops,
                staff: fieldStaff,
                fieldImage: fieldImage,
            };

            const token = localStorage.getItem("token");
            if (!token) {
                alert("No token found. Please log in.");
                return;
            }
            $.ajax({
                url: "http://localhost:8080/api/v1/field",
                type: "POST",
                timeout: 0,
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': 'Bearer ' + token
                },
                data: JSON.stringify(fieldData),
                success: (response) => {
                    console.log("Field added successfully:", response);
                    alert("Field added successfully!");
                    clearFieldForm();
                    loadFieldTable();
                },
                error: (error) => {
                    if (error.status === 403) {
                        alert("Access Denied: You do not have permission to perform this action.");
                    }else{
                        console.error("Error adding field:", error);
                        alert("Failed to add field. Please try again.");
                    }
                },
            });
        })
        .catch((error) => {
            if (error.status === 403) {
                alert("Access Denied: You do not have permission to perform this action.");
            }else{
                console.error("Error converting image to Base64:", error);
                alert("Failed to process the image. Please try again.");
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
    const fieldImageFile = $("#editFieldImage")[0].files[0]; // New image file
    const existingImageBase64 = $("#imageUpdateFieldView img").attr("src"); // Existing image base64

    // Validate required fields
    if (!fieldCode || !fieldName || !fieldLocation || !fieldSize) {
        alert("All fields are required!");
        return;
    }

    // Helper function to handle image conversion
    const convertImageToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve(null);
                return;
            }
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(",")[1]);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };

    // Determine the image to use: new file or existing base64
    const processImage = fieldImageFile
        ? convertImageToBase64(fieldImageFile) // Convert new file
        : Promise.resolve(existingImageBase64 ? existingImageBase64.split(",")[1] : null);

    processImage
        .then((base64Image) => {
            // Prepare the JSON payload
            const updateFieldDTO = {
                fieldCode: fieldCode,
                fieldName: fieldName,
                fieldLocation: fieldLocation,
                fieldSize: fieldSize,
                fieldImage: base64Image, // Base64 string or null
            };

            const token = localStorage.getItem("token");
            if (!token) {
                alert("No token found. Please log in.");
                return;
            }
            $.ajax({
                url: `http://localhost:8080/api/v1/field/${fieldCode}`,
                type: "PUT",
                timeout: 0,
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': 'Bearer ' + token
                },
                data: JSON.stringify(updateFieldDTO),
                success: function () {
                    alert("Field updated successfully!");
                    loadFieldTable();
                    $('#viewFieldModal').modal('hide');
                },
                error: function (xhr) {
                    console.error("Error:", xhr.responseText || xhr.statusText);
                    alert(`Failed to update field details. Error: ${xhr.responseText || xhr.statusText}`);
                },
            });
        })
        .catch((error) => {
            if (error.status === 403) {
                alert("Access Denied: You do not have permission to perform this action.");
              }else{
                console.error("Error converting image to Base64:", error);
                alert("Failed to process the image. Please try again.");
              }
        });
});



function editField(fieldCode) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: `http://localhost:8080/api/v1/field/${fieldCode}`, 
        method: "GET",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token,
        },
        success: (field) => {
            $("#editFieldCode").val(field.fieldCode);
            $("#editFieldName").val(field.fieldName);
            $("#editFieldLocation").val(field.fieldLocation);
            $("#editFieldSize").val(field.fieldSize);

            if (field.fieldImage) {
                const base64Image = `data:image/jpeg;base64,${field.fieldImage}`;
                $("#currentFieldImage1").attr("src", base64Image);
                $("#currentFieldImage1").show();
            } else {
                $("#currentFieldImage1").attr("src", ""); 
            }
        },
        error: (xhr) => {
            if (error.status === 403) {
                alert("Access Denied: You do not have permission to perform this action.");
            }else{
                console.error("Failed to load field data:", xhr.status);
                alert("Failed to load field data. Please try again.");
            }
        }
    });
}


function deleteField(fieldCode) {
    if (confirm("Are you sure you want to delete this field?")) {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("No token found. Please log in.");
            return;
        }
        $.ajax({
            url: `http://localhost:8080/api/v1/field/${fieldCode}`,
            method: "DELETE",
            timeout: 0,
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + token
            },
            success: () => {
                alert("Field deleted successfully!");
                loadFieldTable();
            },
            error: (xhr) => {
                if (error.status === 403) {
                    alert("Access Denied: You do not have permission to perform this action.");
                }else{
                    console.error("Failed to delete field:", xhr.status)
                }
            },
        });
    }
}

$(document).ready(function () {
    $("#signout").on("click", function () {
        const userConfirmed = confirm("Are you sure you want to log out?");
        if (userConfirmed) {
            localStorage.removeItem("token");
            sessionStorage.clear();
  
            window.location.href = "index.html"; 
        }
    });
  });
