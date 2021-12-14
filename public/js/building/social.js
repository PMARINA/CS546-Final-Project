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
    $(document).on('click', '.reply', function(){
        $(this.parent).append(`<form method="POST" class="replyForm">
        <div class="media-content">
        <div class="field">
            <br>
            <label for="replyVal">Add a reply: </label>
            <p class="control">
                <textarea id="replyVal" name="replyVal" class="textarea" placeholder="..."></textarea>
            </p>
            <div class="level-left">
                <div class="level-item">
                <input type="submit" class="button is-info"/>
                </div>
            </div>
        </div>
    </div>
    </form>`)
    })

})(window.jQuery);