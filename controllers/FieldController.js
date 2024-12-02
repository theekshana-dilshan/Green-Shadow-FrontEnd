const fieldCodeRegEx = /^F[0-9]{3}$/;
const fieldNameRegEx = /^[A-Za-z ]{3,50}$/;
const fieldSizeRegEx = /^[0-9]+(\.[0-9]+)?\s?(acres|hectares|sq\.m|sq\.ft)$/i;
const fieldCropRegEx = /^[A-Za-z ,]{3,100}$/;
const fieldStaffRegEx = /^[A-Za-z ,]{3,100}$/;

let fieldValidations = [
    { reg: fieldCodeRegEx, field: $("#fieldCode"), error: "Field Code Pattern: F001" },
    { reg: fieldNameRegEx, field: $("#fieldName"), error: "Field Name: 3-50 letters" },
    { reg: fieldSizeRegEx, field: $("#sizeOfTheField"), error: "Size: e.g., 10 Acres" },
    { reg: fieldCropRegEx, field: $("#cropDetails"), error: "Crops: 3-100 letters" },
    { reg: fieldStaffRegEx, field: $("#staffDetails"), error: "Staff: 3-100 letters" },
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
    $("#saveCrop").attr("disabled", errorCount > 0);
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
                            <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#viewFieldModal"
                                onclick="populateFieldDetails('${field.fieldCode}', '${field.fieldName}', '${field.location}', '${field.size}', '${field.crops}', '${field.staff}', '${field.image1}', '${field.image2}')">View More</button>
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


function handleFieldImageUpload(input, previewElementId) {
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

async function extractFieldImages() {
    const image1 = await extractImageData($("#fieldImage")[0]);
    const image2 = await extractImageData($("#fieldImage2")[0]);
    return { image1, image2 };
}

$("#saveCrop").click(async () => {
    try {
        const { image1, image2 } = await extractFieldImages();

        const newField = {
            fieldCode: $("#fieldCode").val(),
            fieldName: $("#fieldName").val(),
            size: $("#sizeOfTheField").val(),
            crops: $("#cropDetails").val(),
            staff: $("#staffDetails").val(),
            image1: image1,
            image2: image2,
        };

        $.ajax({
            url: "http://localhost:8080/Bootstrap_POS_Backend_Phase_02/api/v1/field",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(newField),
            success: () => {
                alert("Field saved successfully!");
                $("#addFieldModal").modal("hide");
                loadFieldTable();
            },
            error: (xhr) => console.error("Failed to save field:", xhr.status),
        });
    } catch (error) {
        console.error("Image processing error:", error);
    }
});

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


function populateFieldDetails(code, name, location, size, crops, staff, image1, image2) {
    $("#editFieldCode").val(code);
    $("#editFieldName").val(name);
    $("#editFieldLocation").val(location);
    $("#editFieldSize").val(size);
    $("#editFieldCrops").val(crops);
    $("#editFieldStaff").val(staff);
    $("#editFieldImage1").val('');
    $("#editFieldImage2").val('');
    $("#currentFieldImage1").attr("src", image1 || "").show();
    $("#currentFieldImage2").attr("src", image2 || "").show();
}
