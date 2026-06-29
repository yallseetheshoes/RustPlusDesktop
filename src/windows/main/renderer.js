const fcmProgress = document.querySelector(".FCM-progress");
const rustplusProgress = document.querySelector(".Rustplus-progress");
const loaderPage = document.querySelector(".loader");
let loaded = false



const serverApp = {
    main: document.querySelector(".main"),
    main_loader: document.querySelector(".main-loader"),
    main_loader_error: document.querySelector(".main-loader-error"),
    server_sidebar_content: document.querySelector(".server-sidebar-content"),
    sidebar: document.querySelector(".sidebar"),
    sidebar_header: document.querySelector(".sidebar-header"),
    main_settings_overlay: document.querySelector(".main-settings-overlay"),
    main_settings_button: document.querySelector(".main-settings-button"),
    server_settings_overlay: document.querySelector(".server-settings-overlay"),
    server_settings_button: document.querySelector(".server-settings-button"),
}

let servers;
let currentServer;
let serverSwapCD = false;
if (window.startup && window.bridge) {
    window.startup.onLoadingUpdate((data)=>{
        fcmProgress.style.width = `${data.fcm}%`;
        rustplusProgress.style.width = `${data.rustplus}%`;
        if (data.fcm===100 && data.rustplus===100) {
            loaded = true;
            loaderPage.classList.add("finished");
        }
    });
    window.bridge.setCurrentServer((data)=>{
        currentServer = data;
        serverApp.sidebar_header.querySelector(".sidebar-server-name").innerHTML=currentServer.info.name;
        document.querySelectorAll(".server-badge").forEach(b=>b.classList.remove("active"));
        const activeBadge = document.querySelector(`.server-badge[data-key="${data.ip}:${data.port}"]`);
        if (activeBadge) activeBadge.classList.add("active");
        setTimeout(()=>serverApp.main_loader.classList.add("finished"),1000);
    });
    window.bridge.tokenError(()=>{
        serverApp.main_loader_error.classList.add("visible");
    });
    window.bridge.updateServers((data)=>{
        servers = data;
        serverApp.server_sidebar_content.innerHTML = "";
        Object.entries(servers).forEach(([key,server],i) => {
            const badge = document.createElement("div");
            badge.className = "server-badge";
            badge.style.animationDelay = `${i * 60}ms`
            badge.setAttribute("data-popup-right", server.info.name)
            badge.setAttribute("data-key",key);
            badge.innerHTML = `<img draggable="false" src="${server.info.img}" alt="">`
            serverApp.server_sidebar_content.appendChild(badge);
            badge.onclick = () =>{
                if (!badge.classList.contains("active")) {
                    if (!serverSwapCD) {
                        serverSwapCD=true;
                        serverApp.sidebar_header.querySelector(".sidebar-server-name").innerHTML=server.info.name;
                        document.querySelectorAll(".server-badge").forEach(b=>b.classList.remove("active"));
                        badge.classList.add("active");
                        openServer(key);
                        setTimeout(()=>serverSwapCD = false,5000);
                    } else {
                        showCursorToast("Please wait")
                    }

                }
            }
            badge.addEventListener("animationend", () =>{
                badge.style.animation = "none";
            })
        });
    });
    function openServer(key) {
        serverApp.main_loader_error.classList.remove("visible");
        serverApp.main_loader.classList.remove("finished");
        window.bridge.requestServerChange(key);
    }
} else {
    setTimeout(()=>{
        fcmProgress.style.width = "100%";
        rustplusProgress.style.width = "100%";
        loaderPage.classList.add("finished");
    },1000)
}




const tooltip = document.createElement("div");
tooltip.className = "tooltip";
document.body.appendChild(tooltip);

document.addEventListener("mouseover", (e) => {
    const el = e.target.closest("[data-popup-right], [data-popup-left], [data-popup-top], [data-popup-bottom]");
    if (!el) return;

    const rect = el.getBoundingClientRect();

    if (el.dataset.popupRight) {
        tooltip.textContent = el.dataset.popupRight;
        tooltip.style.top = `${rect.top + rect.height / 2}px`;
        tooltip.style.left = `${rect.right + 10}px`;
        tooltip.style.transform = "translateY(-50%) scale(1)";
    } else if (el.dataset.popupLeft) {
        tooltip.textContent = el.dataset.popupLeft;
        tooltip.style.top = `${rect.top + rect.height / 2}px`;
        tooltip.style.left = `${rect.left - 10}px`;
        tooltip.style.transform = "translateY(-50%) translateX(-100%) scale(1)";
    } else if (el.dataset.popupTop) {
        tooltip.textContent = el.dataset.popupTop;
        tooltip.style.top = `${rect.top - 10}px`;
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.transform = "translateX(-50%) translateY(-100%) scale(1)";
    } else if (el.dataset.popupBottom) {
        tooltip.textContent = el.dataset.popupBottom;
        tooltip.style.top = `${rect.bottom + 10}px`;
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.transform = "translateX(-50%) scale(1)";
    }

    tooltip.classList.add("visible");
});

document.addEventListener("mouseout", (e) => {
    if (!e.target.closest("[data-popup-right], [data-popup-left], [data-popup-top], [data-popup-bottom]")) return;
    tooltip.classList.remove("visible");
});
document.addEventListener("contextmenu",(e)=>{
    e.preventDefault();
    const badge = e.target.closest(".server-badge");
    console.log("badge found: ",badge)
});



let cursorToast = document.createElement("div");
cursorToast.className = "cursor-toast";
document.body.appendChild(cursorToast);
let cursorToastTimeout;
function showCursorToast(msg) {
    cursorToast.textContent = msg;
    cursorToast.classList.add("visible");
    clearTimeout(cursorToastTimeout);
    cursorToastTimeout = setTimeout(() => cursorToast.classList.remove("visible"), 1500)
}
document.addEventListener("mousemove",(e)=>{
    cursorToast.style.left = `${e.clientX+12}px`
    cursorToast.style.top = `${e.clientY+12}px`
});
