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
                                onclick="populateCropDetails('${crop.cropCode}', '${crop.commonName}', '${crop.scientificName}', '${crop.image}', '${crop.category}', '${crop.season}', '${crop.field}')">View More</button>
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

$("#saveCrop").click(async () => {
    try {
        const imageData = await extractImageData($("#cropImage")[0]);

        const newCrop = {
            cropCode: $("#cropCode").val(),
            commonName: $("#cropCommonName").val(),
            scientificName: $("#cropScientificName").val(),
            image: imageData,
            category: $("#cropCategory").val(),
            season: $("#cropSeason").val(),
            field: $("#fieldDetails").val(),
        };

        $.ajax({
            url: "http://localhost:8080/Bootstrap_POS_Backend_Phase_02/api/v1/crop",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(newCrop),
            success: () => {
                alert("Crop saved successfully!");
                $("#addCropModal").modal("hide");
                loadCropTable();
            },
            error: (xhr) => console.error("Failed to save crop:", xhr.status),
        });
    } catch (error) {
        console.error("Image processing error:", error);
    }
});


function saveCropDetails() {
    extractImageData($("#editCropImage")[0]).then((imageData) => {
        const updatedCrop = {
            cropCode: $("#editCropCode").val(),
            commonName: $("#editCropCommonName").val(),
            scientificName: $("#editCropScientificName").val(),
            image: imageData,
            category: $("#editCropCategory").val(),
            season: $("#editCropSeason").val(),
            field: $("#editCropField").val(),
        };

        $.ajax({
            url: `http://localhost:8080/Bootstrap_POS_Backend_Phase_02/api/v1/crop/${updatedCrop.cropCode}`,
            method: "PATCH",
            contentType: "application/json",
            data: JSON.stringify(updatedCrop),
            success: () => {
                alert("Crop updated successfully!");
                $("#viewCropModal").modal("hide");
                loadCropTable();
            },
            error: (xhr) => console.error("Failed to update crop:", xhr.status),
        });
    }).catch((error) => {
        console.error("Image processing error:", error);
    });
}


function deleteCrop(code) {
    if (confirm("Are you sure you want to delete this crop?")) {
        $.ajax({
            url: `http://localhost:8080/Bootstrap_POS_Backend_Phase_02/api/v1/crop/${code}`,
            method: "DELETE",
            success: () => {
                alert("Crop deleted successfully!");
                loadCropTable();
            },
            error: (xhr) => console.error("Failed to delete crop:", xhr.status),
        });
    }
}

$(document).ready(() => {
    loadCropTable();

    $("#cropCode, #cropCommonName, #cropScientificName, #cropCategory, #cropSeason, #fieldDetails").on("keyup blur", checkCropValidity);
});


function handleCropImageUpload(input, previewElementId) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            $(`#${previewElementId}`).attr("src", e.target.result).show();
        };
        reader.readAsDataURL(file);
    } else {
        $(`#${previewElementId}`).attr("src", "").hide();
    }
}

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
