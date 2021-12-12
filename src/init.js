window.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = today.getMonth()+1;
    const dd = today.getDate();
    console.log(`${yyyy}年${mm}月${dd}日`)
})