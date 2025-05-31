"use strict";

let lastUploadedFile = "";
let lastPredictions = [];

// SIGNUP
$("form[name=signup_form]").submit(function (e) {
  e.preventDefault();
  const $form = $(this);
  const $error = $form.find(".error");
  const data = $form.serialize();

  $.ajax({
    url: "/user/signup",
    type: "POST",
    data: data,
    dataType: "json",
    success: function () {
      window.location.href = '/dashboard';
    },
    error: function (resp) {
      $error.text(resp.responseJSON.error).removeClass("error--hidden");
    }
  });
});

// LOGIN
$("form[name=login_form]").submit(function (e) {
  e.preventDefault();
  const $form = $(this);
  const $error = $form.find(".error");
  const data = $form.serialize();

  $.ajax({
    url: "/user/login",
    type: "POST",
    data: data,
    dataType: "json",
    success: function () {
      window.location.href = '/dashboard';
    },
    error: function (resp) {
      $error.text(resp.responseJSON.error).removeClass("error--hidden");
    }
  });
});

$("input[name='email'], input[name='password']").on("input", function () {
  $(".error").addClass("error--hidden").text("");
});

// IMAGE UPLOAD
$("#upload-form").on("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(this);

  $.ajax({
    url: "/user/upload",
    type: "POST",
    data: formData,
    processData: false,
    contentType: false,
    success: function (res) {
      lastUploadedFile = res.filepath;
      $("#preview").attr("src", res.filepath).show();
      $("#analyze-btn").prop("disabled", false);
      $("#result").text("");
      $("#download-pdf-btn").hide();
    },
    error: function () {
      alert("Upload failed.");
    }
  });
});

// PREDICTION
$("#analyze-btn").on("click", function () {
    if (!lastUploadedFile) return;

    $.ajax({
        url: "/user/predict",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ filepath: lastUploadedFile }),
        success: function (res) {
            lastPredictions = res.predictions;
            let resultHtml = "<strong>Top Predictions:</strong><br>";
            res.predictions.forEach(pred => {
                resultHtml += `${pred.label}: ${pred.confidence.toFixed(2)}%<br>`;
            });
            $("#result").html(resultHtml);

            $("#download-pdf-btn")
                .data("predictions", res.predictions)
                .show();
        },
        error: function () {
            $("#result").text("Prediction failed");
        }
    });
});



// DOWNLOAD PDF
$("#download-pdf-btn").on("click", function () {
    if (typeof currentUser === "undefined") {
        alert("User info not found.");
        console.error("currentUser is not defined.");
        return;
    }

    const payload = {
        filepath: lastUploadedFile,
        predictions: lastPredictions,
        firstname: currentUser.firstname,
        lastname: currentUser.lastname
    };

    $.ajax({
        url: "/user/download-pdf",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(payload),
        xhrFields: {
            responseType: 'blob'
        },
        success: function (blob) {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "derma_check_report.pdf";
            a.click();
        },
        error: function (xhr, status, error) {
            alert("Failed to generate PDF.");
            console.error("PDF generation error:", xhr.responseText || error);
        }
    });
});

// GOOGLE MAPS API

document.getElementById('find-nearby').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            const map = new google.maps.Map(document.createElement('div'));  // no need to display map
            const service = new google.maps.places.PlacesService(map);

            const request = {
                location: location,
                radius: '5000',
                keyword: 'dermatologist'
            };

            service.nearbySearch(request, function(results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    const list = document.getElementById('clinician-list');
                    list.innerHTML = '';
                    const maxResults = 6;  // limit fot displaying results
                    for (let i = 0; i < Math.min(results.length, maxResults); i++) {
                        const place = results[i];
                        const li = document.createElement('li');
                        const link = document.createElement('a');
                        link.href = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
                        link.target = '_blank';
                        link.textContent = place.name + (place.vicinity ? ` (${place.vicinity})` : '');
                        li.appendChild(link);
                        list.appendChild(li);
                    }

                    if (results.length === 0) {
                        list.innerHTML = '<li>No dermatologists found nearby.</li>';
                    }
                }
            });
        }, function() {
            alert('Geolocation failed.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});
