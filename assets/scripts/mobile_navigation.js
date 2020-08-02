window.onresize = windowResized;

function windowResized() {
    if (document.getElementById("mobile-navigation-check")) {
        if (!(window.matchMedia("screen and (max-width: 425px)").matches) && document.getElementById("mobile-navigation-check").style.display == "block") {
            showNormalNavigationBar();
        }
    }
}

function navigationLinkHome() {
    if (window.matchMedia("screen and (max-width: 425px)").matches) {
        if (document.getElementById("mobile-navigation-check").style.display == "none") {
            showNavigationBar();
        } else {
            hideNavigationBar();
        }
    } else if (!window.matchMedia("screen and (max-width: 425px)").matches) {
        window.open("/", "_self");
    } else {
        console.log("Error.\nIf you see this message, please report it at https://github.com/ZhongRuoyu/zhongruoyu.com/issues.\nThank you.");
    }
}

function showNavigationBar() {
    document.getElementById("mobile-navigation-check").style.display = "block";
    let list_items = document.getElementsByClassName("mobile-navigation-list-item-animated");
    let list_items_count = list_items.length;
    let height = calculateHeight(list_items_count) + 48;
    $(document.getElementById("page-content")).animate({ paddingTop: (height.toString() + "px") }, 100 * (list_items_count + 1), "swing").delay(200);
    for (let i = 0; i < list_items_count; i++) {
        $(list_items[i]).delay(100 * (i + 1)).fadeIn(300, "swing").delay(100 * (list_items_count - i - 1));
    }
}

function hideNavigationBar() {
    let list_items = document.getElementsByClassName("mobile-navigation-list-item-animated");
    let list_items_count = list_items.length;
    for (let i = list_items_count - 1; i >= 0; i--) {
        $(list_items[i]).delay(100 * (list_items_count - i - 1)).fadeOut(300, "swing").delay(100 * (i + 1));
    }
    $(document.getElementById("page-content")).delay(200).animate({ paddingTop: "7rem" }, 100 * (list_items_count + 1), "swing", function () {
        document.getElementById("page-content").removeAttribute("style");
    });
    document.getElementById("mobile-navigation-check").style.display = "none";
}

function calculateHeight(items_count) {
    let home_height = 64;
    let items_height = items_count * 64;
    let height = home_height + items_height;
    return height;
}

function showNormalNavigationBar() {
    let list_items = document.getElementsByClassName("mobile-navigation-list-item-animated");
    let list_items_count = list_items.length;
    for (let i = list_items_count - 1; i >= 0; i--) {
        $(list_items[i]).finish();
        list_items[i].removeAttribute("style");
    }
    $(document.getElementById("page-content")).finish();
    document.getElementById("page-content").removeAttribute("style");
    document.getElementById("mobile-navigation-check").style.display = "none";
    document.getElementById("mobile-navigation-list-item-home").style.display = "none";
}

windowResized();
