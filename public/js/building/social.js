(function ($) {
    $("#newCommentForm").submit(function(event) {
        $("#errorBodyComment").hide();
        const commentText = $("#commentVal").val();
        if(!(commentText.replace(/\s/g, '').length)){
            event.preventDefault();
            $("#errorBodyComment").text("Comments cannot be empty");
            $("#errorBodyComment").show();
        }
    });

})(window.jQuery);