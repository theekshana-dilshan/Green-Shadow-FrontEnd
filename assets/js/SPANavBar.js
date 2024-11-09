$('#dashboardPage').css('display','none');
$('#cropPage').css('display','none');
$('#vehiclePage').css('display','block');

$('#btnDashBoard').addClass('active');

$('#btnDashBoard').click(function (){
    $('#dashboardPage').css('display','block');
    $('#cropPage').css('display','none');
    $('#vehiclePage').css('display','none');

    $('.nav-link').removeClass('active');
    $('#btnDashBoard').addClass('active');
});

$('#btnCrop').click(function (){
    $('#dashboardPage').css('display','none');
    $('#cropPage').css('display','block');
    $('#vehiclePage').css('display','none');

    $('.nav-link').removeClass('active');
    $('#btnCrop').addClass('active');
});

$('#btnVehicle').click(function (){
    $('#dashboardPage').css('display','none');
    $('#cropPage').css('display','none');
    $('#vehiclePage').css('display','block');

    $('.nav-link').removeClass('active');
    $('#btnVehicle').addClass('active');
});

