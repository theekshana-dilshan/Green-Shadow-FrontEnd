$('#dashboardPage').css('display','block');
$('#cropPage').css('display','none');
$('#vehiclePage').css('display','none');
$('#EquipmentPage').css('display','none');
$('#StaffPage').css('display','none');
$('#fieldPage').css('display','none');
$('#logMonitoringPage').css('display','none');
$('#addProfilePage').css('display','none');

$('#btnDashBoard').addClass('active');

$('#btnDashBoard').click(function (){
    $('#dashboardPage').css('display','block');
    $('#cropPage').css('display','none');
    $('#vehiclePage').css('display','none');
    $('#EquipmentPage').css('display','none')
    $('#StaffPage').css('display','none');
    $('#fieldPage').css('display','none');
    $('#logMonitoringPage').css('display','none');
    $('#addProfilePage').css('display','none');

    $('.nav-link').removeClass('active');
    $('#btnDashBoard').addClass('active');
});

$('#btnField').click(function (){
    $('#dashboardPage').css('display','none');
    $('#cropPage').css('display','none');
    $('#vehiclePage').css('display','none');
    $('#EquipmentPage').css('display','none')
    $('#StaffPage').css('display','none');
    $('#fieldPage').css('display','block');
    $('#logMonitoringPage').css('display','none');
    $('#addProfilePage').css('display','none');

    $('.nav-link').removeClass('active');
    $('#btnField').addClass('active');
});

$('#btnCrop').click(function (){
    $('#dashboardPage').css('display','none');
    $('#cropPage').css('display','block');
    $('#vehiclePage').css('display','none');
    $('#EquipmentPage').css('display','none')
    $('#StaffPage').css('display','none');
    $('#fieldPage').css('display','none');
    $('#logMonitoringPage').css('display','none');
    $('#addProfilePage').css('display','none');

    $('.nav-link').removeClass('active');
    $('#btnCrop').addClass('active');
});

$('#btnStaff').click(function (){
    $('#dashboardPage').css('display','none');
    $('#cropPage').css('display','none');
    $('#vehiclePage').css('display','none');
    $('#EquipmentPage').css('display','none')
    $('#StaffPage').css('display','block');
    $('#fieldPage').css('display','none');
    $('#logMonitoringPage').css('display','none');
    $('#addProfilePage').css('display','none');

    $('.nav-link').removeClass('active');
    $('#btnStaff').addClass('active');
});

$('#btnLog').click(function (){
    $('#dashboardPage').css('display','none');
    $('#cropPage').css('display','none');
    $('#vehiclePage').css('display','none');
    $('#EquipmentPage').css('display','none')
    $('#StaffPage').css('display','none');
    $('#fieldPage').css('display','none');
    $('#logMonitoringPage').css('display','block');
    $('#addProfilePage').css('display','none');

    $('.nav-link').removeClass('active');
    $('#btnLog').addClass('active');
});

$('#btnVehicle').click(function (){
    $('#dashboardPage').css('display','none');
    $('#cropPage').css('display','none');
    $('#vehiclePage').css('display','block');
    $('#EquipmentPage').css('display','none')
    $('#StaffPage').css('display','none');
    $('#fieldPage').css('display','none');
    $('#logMonitoringPage').css('display','none');
    $('#addProfilePage').css('display','none');

    $('.nav-link').removeClass('active');
    $('#btnVehicle').addClass('active');
});

$('#btnEquipment').click(function (){
    $('#dashboardPage').css('display','none');
    $('#cropPage').css('display','none');
    $('#vehiclePage').css('display','none');
    $('#EquipmentPage').css('display','block');
    $('#StaffPage').css('display','none');
    $('#fieldPage').css('display','none');
    $('#logMonitoringPage').css('display','none');
    $('#addProfilePage').css('display','none');

    $('.nav-link').removeClass('active');
    $('#btnEquipment').addClass('active');
});

$('#btnAddProfile').click(function (){
    $('#dashboardPage').css('display','none');
    $('#cropPage').css('display','none');
    $('#vehiclePage').css('display','none');
    $('#EquipmentPage').css('display','none')
    $('#StaffPage').css('display','none');
    $('#fieldPage').css('display','none');
    $('#logMonitoringPage').css('display','none');
    $('#addProfilePage').css('display','block');

    $('.nav-link').removeClass('active');
    $('#btnAddProfile').addClass('active');
});
