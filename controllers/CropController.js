const cropCodeRegEx = /^CROP-\d{4}$/;
const cropNameRegEx = /^[A-Za-z ]{3,50}$/;
const cropCategoryRegEx = /^[A-Za-z ]+$/;
const cropSeasonRegEx = /^[A-Za-z ]+$/;
const cropFieldRegEx = /^FIELD-\d{4}$/;

let cropValidations = [
    { reg: cropCodeRegEx, field: $("#cropCode"), error: "Crop Code Pattern: CROP-0001" },
    { reg: cropNameRegEx, field: $("#cropCommonName"), error: "Name: 3-50 letters" },
    { reg: cropNameRegEx, field: $("#cropScientificName"), error: "Scientific Name: 3-50 letters" },
    { reg: cropCategoryRegEx, field: $("#cropCategory"), error: "Category: Alphabetic only" },
    { reg: cropSeasonRegEx, field: $("#cropSeason"), error: "Season: Alphabetic only" },
    { reg: cropFieldRegEx, field: $("#fieldDetails"), error: "Field: Alphanumeric only" },
];

function checkCropValidity() {
    let errorCount = 0;
    for (let validation of cropValidations) {
        if (check(validation.reg, validation.field)) {
            setSuccess(validation.field, "");
        } else {
            errorCount++;
            setError(validation.field, validation.error);
        }
    }
    $("#saveCrop").attr("disabled", errorCount > 0);
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
    loadCropTable();
    cropIdGenerate();

    $("#cropCode, #cropCommonName, #cropScientificName, #cropCategory, #cropSeason, #fieldDetails").on("keyup blur", checkCropValidity);
});

function loadCropTable() {

    $("#tblCrop > tbody > tr").remove();

    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: "http://localhost:8080/api/v1/crop",
        method: "GET",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        success: (crops) => {
            crops.forEach((crop) => {
                let row = `
                    <tr>
                        <td>${crop.cropCode}</td>
                        <td>${crop.commonName}</td>
                        <td>${crop.scientificName}</td>
                        <td>${crop.category}</td>
                        <td>${crop.season}</td>
                        <td>${crop.fieldDTO.fieldCode}</td>
                        <td>
                            <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#viewCropModal" 
                                onclick="viewCropDetails('${crop.cropCode}')">View More</button>
                        </td>
                        <td>
                            <button class="btn btn-danger btn-sm" onclick="deleteCrop('${crop.cropCode}')">Delete</button>
                        </td>
                    </tr>`;
                $("#tblCrop tbody").append(row);
            });
        },
        error: (xhr) => console.error("Failed to load crops:", xhr.status),
    });
}

function viewCropDetails(cropCode) {
    document.getElementById("viewCropModal").style.display = "block";

    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: `http://localhost:8080/api/v1/crop/${cropCode}`,
        type: "GET",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        success: (crop) => {
            if (!crop) {
                alert("No data found for the selected crop.");
                return;
            }


            $("#editCropCode").val(crop.cropCode);
            $("#editCropCommonName").val(crop.commonName);
            $("#editCropScientificName").val(crop.scientificName || "N/A");
            $("#imageView").html(`<img src="data:image/png;base64,${crop.image}" alt="Crop Image" style="width: 150px; height: 100px;">`);
            $("#editCropCategory").val(crop.category || "N/A");
            $("#editCropSeason").val(crop.season || "N/A");
            $("#editCropField").val(crop.fieldDTO.fieldCode || "N/A");
        },
        error: (xhr, status, error) => {
            if (error.status === 403) {
                alert("Access Denied: You do not have permission to perform this action.");
            }else{
                console.error("Error fetching crop details:", error);
                alert("Failed to fetch crop details. Please try again.");
            }
        }
    });
}

document.getElementById("editCropImage").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imageData = e.target.result;
            $("#imageUpdateView").html(
                `<img src="${imageData}" alt="Updated Crop Image" style="width: 150px; height: 80px;">`
            );
        };
        reader.readAsDataURL(file); // Convert file to base64 string
    }
});

document.getElementById("changeImage").addEventListener("click", function () {
    document.getElementById("editCropImage").click();
});

function closeModal() {
    document.getElementById("viewCropModal").style.display = "none";
}


window.onclick = function(event) {
    const modal = document.getElementById("viewCropModal");
    if (event.target == modal) {
        closeModal();
    }
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
            const imageUpdateView = document.getElementById('imageUpdateView');
            imageUpdateView.innerHTML = '';
            imageUpdateView.appendChild(img);
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    }
}

function populateCropDetails(code, commonName, scientificName, image, category, season, field) {
    $("#editCropCode").val(code);
    $("#editCropCommonName").val(commonName);
    $("#editCropScientificName").val(scientificName);
    $("#editCropImage").val('');
    $("#currentCropImage").attr("src", image || "");
    $("#editCropCategory").val(category);
    $("#editCropSeason").val(season);
    $("#editCropField").val(field);
}

function saveCrop(){

    var cropCode = $("#cropCode").val();
    var cropName = $("#cropCommonName").val();
    var cropScientificName = $("#cropScientificName").val();
    var cropCategory = $("#cropCategory").val();
    var cropSeason = $("#cropSeason").val();
    var cropField = $("#fieldDetails").val();

    var cropImage = $("#cropImage")[0].files[0];

    if (!cropCode || !cropName || !cropScientificName || !cropCategory || !cropSeason) {
        alert("All fields are required!");
        return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
        var base64Image = e.target.result;

        var formData = {
            cropCode: cropCode,
            commonName: cropName,
            scientificName: cropScientificName,
            image: base64Image,
            category: cropCategory,
            season: cropSeason,
            fieldDTO: {"fieldCode": cropField},
        };


        const token = localStorage.getItem("token");
        if (!token) {
            alert("No token found. Please log in.");
            return;
        }
        $.ajax({
            url: "http://localhost:8080/api/v1/crop",
            type: "POST",
            timeout: 0,
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + token
            },
            data: JSON.stringify(formData),
            success: (response) => {
                console.log("Crop added successfully:", response);
                alert("Crop added successfully!");
                clearFields();
                cropIdGenerate();
                loadCropTable();
            },
            error: (error) => {
                if (error.status === 403) {
                    alert("Access Denied: You do not have permission to perform this action.");
                }else{
                    console.error("Error adding crop:", error.responseText || error.statusText);
                    alert("Failed to add crop. Please try again.");
                }
            },
        });
    };

    reader.readAsDataURL(cropImage);
}

document.getElementById("saveCrop").addEventListener("click", function () {

    var cropCode = $("#cropCode").val();
    var cropName = $("#cropCommonName").val();
    var cropScientificName = $("#cropScientificName").val();
    var cropCategory = $("#cropCategory").val();
    var cropSeason = $("#cropSeason").val();
    var cropField = $("#fieldDetails").val();

    var cropImage = $("#cropImage")[0].files[0];

    if (!cropCode || !cropName || !cropScientificName || !cropCategory || !cropSeason) {
        alert("All fields are required!");
        return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
        var base64Image = e.target.result;

        var formData = {
            cropCode: cropCode,
            commonName: cropName,
            scientificName: cropScientificName,
            image: base64Image,
            category: cropCategory,
            season: cropSeason,
            fieldDTO: {"fieldCode": cropField},
        };


        const token = localStorage.getItem("token");
        if (!token) {
            alert("No token found. Please log in.");
            return;
        }
        $.ajax({
            url: "http://localhost:8080/api/v1/crop",
            type: "POST",
            timeout: 0,
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + token
            },
            data: JSON.stringify(formData),
            success: (response) => {
                console.log("Crop added successfully:", response);
                alert("Crop added successfully!");
                clearFields();
                cropIdGenerate();
                loadCropTable();
            },
            error: (error) => {
                if (error.status === 403) {
                    alert("Access Denied: You do not have permission to perform this action.");
                }else{
                    console.error("Error adding crop:", error.responseText || error.statusText);
                    alert("Failed to add crop. Please try again.");
                }
            },
        });
    };

    reader.readAsDataURL(cropImage);
});

function cropIdGenerate() {
    
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No token found. Please log in.");
        return;
    }
    $.ajax({
        url: "http://localhost:8080/api/v1/crop",
        type: "GET",
        timeout: 0,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        success: function (response) {
            if (Array.isArray(response) && response.length > 0) {
                // Sort crops based on cropCode to ensure last one is correct
                response.sort((a, b) => {
                    const aNumber = parseInt(a.cropCode.split('-')[1]);
                    const bNumber = parseInt(b.cropCode.split('-')[1]);
                    return aNumber - bNumber;
                });

                // Get the last crop code
                const lastCrop = response[response.length - 1];
                const lastCropCode = lastCrop.cropCode;

                // Extract the numeric part of the crop code
                const lastIdParts = lastCropCode.split('-');
                if (lastIdParts.length === 2 && !isNaN(lastIdParts[1])) {
                    const lastNumber = parseInt(lastIdParts[1], 10);

                    // Generate the next crop ID
                    const nextId = `CROP-${String(lastNumber + 1).padStart(4, '0')}`;
                    $("#cropCode").val(nextId);
                } else {
                    console.warn("Invalid crop code format:", lastCropCode);
                    $("#cropCode").val("CROP-0001");
                }
            } else {
                // No crops found, start with the default ID
                $("#cropCode").val("CROP-0001");
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching crops:", xhr.responseText || error);
            alert("Unable to fetch the last Crop ID. Using default ID.");
            $("#cropCode").val("CROP-0001");
        }
    });
}


function deleteCrop(cropCode) {
    if (confirm("Are you sure you want to delete this crop?")) {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("No token found. Please log in.");
            return;
        }
        $.ajax({
            url: `http://localhost:8080/api/v1/crop/${cropCode}`,
            type: "DELETE",
            timeout: 0,
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + token
            },
            success: function (response) {
                alert("Crop deleted successfully.");
                $(`#cropTable tbody tr`).filter(function () {
                    return $(this).find("td").eq(0).text().trim() === cropCode;
                }).remove();
                loadCropTable();
            },
            error: function (xhr, status, error) {
                if (error.status === 403) {
                    alert("Access Denied: You do not have permission to perform this action.");
                }else{
                    console.error("Error deleting crop:", error);
                    alert("Failed to delete the crop. Please try again.");
                }
            }
        });
    }
}

function updateCrop(){
    var cropCode = $("#editCropCode").val();
    var cropName = $("#editCropCommonName").val();
    var scientificName = $("#editCropScientificName").val();
    var category = $("#editCropCategory").val();
    var season = $("#editCropSeason").val();
    var fieldDTO = $("#editCropField").val();

    var cropImage = $("#editCropImage")[0].files[0];
    var imageBase64 = $("#imageUpdateView img").attr("src");

    if (!cropCode || !cropName || !scientificName || !category || !season || !field) {
        alert("All fields except the image are required!");
        return;
    }

    // Function to send data after converting the image to Base64 (if needed)
    function sendUpdateRequest(base64Image) {
        var data = {
            cropCode: cropCode,
            commonName: cropName,
            scientificName: scientificName,
            category: category,
            season: season,
            field_code: fieldDTO,
            image: base64Image, // Include Base64 image (if available)
        };

        const token = localStorage.getItem("token");
        if (!token) {
            alert("No token found. Please log in.");
            return;
        }
        $.ajax({
            url: `http://localhost:8080/api/v1/crop/${cropCode}`,
            type: "PUT",
            timeout: 0,
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + token
            },
            data: JSON.stringify(data),
            success: function (response) {
                alert("Crop updated successfully!");
                loadCropTable();
            },
            error: function (xhr, status, error) {
                if (error.status === 403) {
                    alert("Access Denied: You do not have permission to perform this action.");
                }else{
                    console.error("Error response:", xhr.responseText || error);
                    alert(`Failed to update crop details. Error: ${xhr.responseText || error}`);
                }
            },
        });
    }

    if (cropImage) {
        // If a new image is uploaded, convert it to Base64
        var reader = new FileReader();
        reader.onload = function (e) {
            var base64Image = e.target.result; // Get Base64 string
            sendUpdateRequest(base64Image);
        };
        reader.readAsDataURL(cropImage); // Convert file to Base64
    } else if (imageBase64) {
        // If no new image is uploaded, use the existing Base64 image
        sendUpdateRequest(imageBase64);
    } else {
        alert("No image provided!");
    }
};


function base64ToBlob(base64Data) {
    const byteString = atob(base64Data.split(",")[1]); // Decode base64
    const mimeString = base64Data.split(",")[0].split(":")[1].split(";")[0]; // Extract MIME type

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}


document.getElementById("editCropImage").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imageData = e.target.result;
            $("#imageUpdateView").html(
                `<img src="${imageData}" alt="Updated Crop Image" style="width: 100px; height: 80px;">`
            );
        };
        reader.readAsDataURL(file);
    }
});

setfieldId();
function setfieldId() {
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
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        success: function (response) {
            if (Array.isArray(response)) {
                $("#fieldDetails").empty();

                response.forEach(function (field) {
                    if (field.fieldCode) {
                        $("#fieldDetails").append(
                            `<option value="${field.fieldCode}">${field.fieldCode}</option>`
                        );
                    }
                });

                if ($("#fieldDetails").children().length === 0) {
                    $("#fieldDetails").append(
                        `<option value="FIELD-0001">FIELD-0001</option>`
                    );
                }
            } else {
                console.warn("Invalid response format. Setting default field ID.");
                $("#fieldDetails").html(
                    `<option value="FIELD-0001">FIELD-0001</option>`
                );
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching fields:", error);
            alert("Unable to fetch fields. Using default field ID.");
            $("#fieldDetails").html(
                `<option value="FIELD-0001">FIELD-0001</option>`
            );
        }
    });
}
