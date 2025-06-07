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

    const fileInput = $("input[name='image']")[0];
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file.");
        return;
    }

    // Проверка MIME-типа
    if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed.");
        return;
    }

    const formData = new FormData();
    formData.append("image", file);

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
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            $.ajax({
                url: "/user/find-nearby",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ latitude: lat, longitude: lng }),
                success: function(res) {
                    const list = document.getElementById('clinician-list');
                    list.innerHTML = '';
                    const results = res.results || [];
                    const maxResults = 5;

                    if (results.length === 0) {
                        list.innerHTML = '<li>No dermatologists found nearby.</li>';
                    } else {
                        for (let i = 0; i < Math.min(results.length, maxResults); i++) {
                          const place = results[i];

                          const li = document.createElement('li');
                          const link = document.createElement('a');
                          link.href = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
                          link.target = '_blank';
                          link.textContent = place.name + (place.vicinity ? ` (${place.vicinity})` : '');
                          li.appendChild(link);

                          const separator = document.createElement('li');
                          separator.innerHTML = "<span style='color: #aaa;'>----------------------------</span>";

                          list.appendChild(li);
                          if (i < maxResults - 1) list.appendChild(separator);
                      }

                    }
                },
                error: function() {
                    alert('Failed to retrieve nearby dermatologists.');
                }
            });

        }, function() {
            alert('Geolocation failed.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

