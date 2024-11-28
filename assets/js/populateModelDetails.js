function populateFieldDetails(code, name, location, size, crops, staff, image1, image2) {
    document.getElementById('editFieldCode').value = code;
    document.getElementById('editFieldName').value = name;
    document.getElementById('editFieldLocation').value = location;
    document.getElementById('editFieldSize').value = size;
    document.getElementById('editFieldCrops').value = crops;
    document.getElementById('editFieldStaff').value = staff;
    document.getElementById('currentFieldImage1').src = image1;
    document.getElementById('currentFieldImage2').src = image2;
}

function populateCropDetails(code, commonName, scientificName, image, category, season, field) {
    document.getElementById('editCropCode').value = code;
    document.getElementById('editCropCommonName').value = commonName;
    document.getElementById('editCropScientificName').value = scientificName;
    document.getElementById('currentCropImage').src = image;
    document.getElementById('editCropCategory').value = category;
    document.getElementById('editCropSeason').value = season;
    document.getElementById('editCropField').value = field;
}
