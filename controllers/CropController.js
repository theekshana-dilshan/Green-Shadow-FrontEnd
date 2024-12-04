const cropCodeRegEx = /^C[0-9]{3}$/;
const cropNameRegEx = /^[A-Za-z ]{3,50}$/;
const cropCategoryRegEx = /^[A-Za-z ]+$/;
const cropSeasonRegEx = /^[A-Za-z ]+$/;
const cropFieldRegEx = /^[A-Za-z0-9 ]+$/;

let cropValidations = [
    { reg: cropCodeRegEx, field: $("#cropCode"), error: "Crop Code Pattern: C001" },
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

function loadCropTable() {
    $("#tblCrop > tbody > tr").remove();

    $.ajax({
        url: "http://localhost:8080/Bootstrap_POS_Backend_Phase_02/api/v1/crop",
        method: "GET",
        success: (crops) => {
            crops.forEach((crop) => {
                let row = `
                    <tr>
                        <td>${crop.cropCode}</td>
                        <td>${crop.commonName}</td>
                        <td>${crop.scientificName}</td>
                        <td>${crop.category}</td>
                        <td>${crop.season}</td>
                        <td>${crop.field}</td>
                        <td>
                            <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#viewCropModal" 
                                onclick="viewCropDetails('${crop.cropCode})">View More</button>
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

    $.ajax({
        url: `http://localhost:5050/green/api/v1/crop/${cropCode}`,
        type: "GET",
        contentType: "application/json",
        success: (crop) => {
            if (!crop) {
                alert("No data found for the selected crop.");
                return;
            }

            console.log(crop)

            $("#editCropCode").text(crop.cropCode);
            $("#editCropCommonName").text(crop.commonName);
            $("#editCropScientificName").text(crop.scientificName || "N/A");
            $("#imageView").html(`<img src="data:image/png;base64,${crop.image}" alt="Crop Image" style="width: 150px; height: 100px;">`);
            $("#editCropCategory").text(crop.category || "N/A");
            $("#editCropSeason").text(crop.season || "N/A");
            $("#editCropField").text(crop.field_code?.fieldCode || "N/A");
        },
        error: (xhr, status, error) => {
            console.error("Error fetching crop details:", error);
            alert("Failed to fetch crop details. Please try again.");
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

document.getElementById("fileInput").addEventListener("change", function (event) {
    const file = event.target.files[0]; // Get the selected file

    if (file) {
        const reader = new FileReader();

        // When the file is loaded, display it inside the div
        reader.onload = function (e) {
            const imageUpdateView = document.getElementById("imageUpdateView");
            imageUpdateView.innerHTML = '';
            const img = document.createElement("img");
            img.src = e.target.result;
            img.style.maxWidth = "100%";
            img.style.maxHeight = "100%";
            imageUpdateView.appendChild(img);
        };

        reader.readAsDataURL(file); // Convert the file to a data URL
    }
});

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

$("#saveCrop").on('click', function() {
    var cropCode = $("#cropCode").val();
    var cropName = $("#cropCommonName").val();
    var cropScientificName = $("#cropScientificName").val();
    var cropCategory = $("#cropCategory").val();
    var cropSeason = $("#cropSeason").val();
    var cropField = $("#fieldDetails").val();

    var cropImage = $("#cropImage")[0].files[0];

    var formData = new FormData();
    formData.append("cropCode", cropCode);
    formData.append("commonName", cropName);
    formData.append("scientificName", cropScientificName);
    formData.append("image", cropImage);
    formData.append("category", cropCategory);
    formData.append("season", cropSeason);
    formData.append("field_code", cropField);

    $.ajax({
        url: "http://localhost:5050/green/api/v1/crop",
        type: "POST",
        processData: false,
        contentType: false,
        data: formData,
        success: (response) => {
            console.log("Crop added successfully:", response);
            alert("Crop added successfully!");
            clearFields();
            cropIdGenerate();
        },
        error: (error) => {
            console.error("Error adding crop:", error);
            alert("Failed to add crop. Please try again.");
        }
    });
});


function saveCropDetails() {
    var cropCode = $("#inpF1").val();
    var cropName = $("#inpF2").val();
    var cropScientificName = $("#inpF3").val();
    var cropCategory = $("#inpF5").val();
    var cropSeason = $("#inpF6").val();
    var cropField = $("#inpF7").val();

    var cropImage = $("#inpF4")[0].files[0];

    var formData = new FormData();
    formData.append("cropCode", cropCode);
    formData.append("commonName", cropName);
    formData.append("scientificName", cropScientificName);
    formData.append("image", cropImage);
    formData.append("category", cropCategory);
    formData.append("season", cropSeason);
    formData.append("field_code", cropField); // Corrected the name to field_code

    $.ajax({
        url: "http://localhost:5050/green/api/v1/crop",
        type: "POST",
        processData: false,
        contentType: false,
        data: formData,
        success: (response) => {
            console.log("Crop added successfully:", response);
            alert("Crop added successfully!");
            clearFields();
            cropIdGenerate(); // Clear input fields after success
        },
        error: (error) => {
            console.error("Error adding crop:", error);
            alert("Failed to add crop. Please try again.");
        }
    });
}

function cropIdGenerate() {
    $.ajax({
        url: "http://localhost:5050/green/api/v1/crop",
        type: "GET",
        success: function (response) {
            if (Array.isArray(response) && response.length > 0) {
                const lastCrop = response[response.length - 1];
                const lastCropCode = lastCrop.cropCode;

                const lastIdParts = lastCropCode.split('-');
                const lastNumber = parseInt(lastIdParts[1]);
                const nextId = `CROP-${String(lastNumber + 1).padStart(4, '0')}`;

                $("#editCropCode").val(nextId);
            } else {
                $("#editCropCode").val("CROP-0001");
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching last Crop ID:", error);
            alert("Unable to fetch the last Crop ID. Using default ID.");
            $("#editCropCode").val('CROP-0001');
        }
    });
}


function deleteCrop(cropCode) {
    if (confirm("Are you sure you want to delete this crop?")) {
        $.ajax({
            url: `http://localhost:5050/green/api/v1/crop/${cropCode}`,
            type: "DELETE",
            success: function (response) {
                alert("Crop deleted successfully.");
                $(`#cropTable tbody tr`).filter(function () {
                    return $(this).find("td").eq(0).text().trim() === cropCode;
                }).remove();
            },
            error: function (xhr, status, error) {
                console.error("Error deleting crop:", error);
                alert("Failed to delete the crop. Please try again.");
            }
        });
    }
}

$(document).ready(() => {
    cropIdGenerate();
    loadCropTable();
    $("#cropCode, #cropCommonName, #cropScientificName, #cropCategory, #cropSeason, #fieldDetails").on("keyup blur", checkCropValidity);
});

document.getElementById("changeImage").addEventListener("click", function () {
    document.getElementById("editCropImage").click();
});

document.getElementById("cropUpdateBtn").addEventListener("click", function () {
    var cropCode = $("#editCropCode").val();
    var cropName = $("#editCropCommonName").val();
    var scientificName = $("#editCropScientificName").val();
    var category = $("#editCropCategory").val();
    var season = $("#editCropSeason").val();
    var field = $("#editCropField").val();

    var cropImage = $("#editCropImage")[0].files[0];

    var imageBase64 = $("#imageUpdateView img").attr("src");

    if (!cropCode || !cropName || !scientificName || !category || !season || !field) {
        alert("All fields except the image are required!");
        return;
    }

    const formData = new FormData();
    formData.append("cropCode", cropCode);
    formData.append("commonName", cropName);
    formData.append("scientificName", scientificName);
    formData.append("category", category);
    formData.append("season", season);
    formData.append("field_code", field);

    if (cropImage) {
        formData.append("image", cropImage);
    } else if (imageBase64) {
        const blob = base64ToBlob(imageBase64);
        formData.append("image", blob, "existing-image.png");
    } else {
        alert("No image provided!");
        return;
    }

    updateCropDetails(cropCode, formData);
});

function updateCropDetails(cropCode, formData) {
    $.ajax({
        url: `http://localhost:5050/green/api/v1/crop/${cropCode}`,
        type: "PUT",
        processData: false,
        contentType: false,
        data: formData,
        success: function (data) {
            console.log("Success:", data);
            alert("Crop updated successfully!");
        },
        error: function (xhr, status, error) {
            console.error("Error response:", xhr.responseText || error);
            alert(`Failed to update crop details. Error: ${xhr.responseText || error}`);
        },
    });
}

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

document.getElementById("changeImage").addEventListener("click", function () {
    document.getElementById("editCropImage").click();
});


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
    $.ajax({
        url: "http://localhost:5050/green/api/v1/field",
        type: "GET",
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
