const $id = (id) => document.getElementById(id);

(async function remplirFondSelect() {
    const select = document.getElementById("fondSelect");
    if (!select) return setTimeout(remplirFondSelect, 500);
    select.innerHTML = "";

    try {
        const response = await fetch("Images/fonds/fonds.json");
        const data = await response.json();

        data.filter(name => name.startsWith("fond-"))
            .forEach(name => {
                const label = name
                    .replace(/^fond-/, "")
                    .replace(/\.[^/.]+$/, "")
                    .replaceAll(/-/g, " ")
                    .replaceAll(/\b\w/g, l => l.toUpperCase());

                const option = document.createElement("option");
                option.value = name;
                option.textContent = label;
                select.append(option);
                select.value = "fond-defaut.png";
            });

        select.addEventListener("change", e => {
            $id("captureZone").style.backgroundImage =
                `url('Images/fonds/${e.target.value}')`;
        });

    } catch (err) {
        console.error("Erreur chargement fonds.json :", err);
    }
})();

(function initImageUploader() {
    const img = $id('image'), input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.append(input);
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (ev) => {
            img.src = ev.target.result;
            saveState();
        };

        reader.readAsDataURL(file);
    });

    img.addEventListener('click', () => input.click());
})();

(function initExport() {
    const btn = $id('save');
    btn.addEventListener('click', async () => {
        btn.disabled = true;
        const loireAtlantique = $id("loire-atlantique");
        let cadre = loireAtlantique;
        if (loireAtlantique.style.display == "none") cadre = $id('captureZone');

        const canvas = await html2canvas(cadre, { scale: 2.731 });

        const link = document.createElement('a');
        link.download = "waze_facebook_" + time();
        link.href = canvas.toDataURL('image/png');
        link.click();
        btn.disabled = false;
    });

    function time() {
        const pad = n => String(n).padStart(2, '0'), date = new Date();
        return date.getFullYear() + pad(date.getMonth() + 1) + pad(date.getDate()) + pad(date.getHours())
    }
})();

(function switchWaze() {
    $id("switch-waze-la").addEventListener("click", () => {
        $id("savoie").style.display = "none";
        $id("loire-atlantique").style.display = "flex";
        $id("fondSelect").style.display = "none"
    });

    $id("switch-waze-sv").addEventListener("click", () => {
        $id("savoie").style.display = "flex";
        $id("loire-atlantique").style.display = "none";
        $id("fondSelect").style.display = "block"
    });
})();

(function textStyle() {
    $id("input-color-text").addEventListener('input', e => applyTextStyle("color", e.target.value));
    $id("input-highlight-text").addEventListener('input', e => applyTextStyle("highlight", e.target.value));
    $id("textIncrease").addEventListener('click', () => applyTextStyle("size", null, 2));
    $id("textDecrease").addEventListener('click', () => applyTextStyle("size", null, -2));

    $id("input-color-text").addEventListener("mouseenter", e => {
        $id("color-text").style.background = "#eee";
    });
    $id("input-color-text").addEventListener("mouseleave", e => {
        $id("color-text").style.background = null;
    });

    function applyTextStyle(type, color, size) {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        const range = sel.getRangeAt(0);
        if (range.collapsed) return;

        const span = document.createElement('span');

        switch (type) {
            case "color": span.style.color = color; $id("color-text").style.color = color; break;
            case "highlight": span.style.backgroundColor = color; $id("highlight-text").style.backgroundColor = color; break;
            case "size": span.style.fontSize = Math.max(8, parseInt(window.getComputedStyle(range.startContainer.parentElement).fontSize) + size) + "px"; break;
        }

        span.append(range.extractContents());
        range.insertNode(span);

        range.selectNodeContents(span);
        sel.removeAllRanges();
        sel.addRange(range);
    }
})();

(function textSizeInput() {
    document.querySelectorAll(".textSize").forEach(textSize => {
        for (let i = 2; i <= 50; i += 2) {
            const option = document.createElement("option");
            option.value = i;
            option.innerText = i + "px";
            textSize.append(option);
        }

        document.addEventListener("selectionchange", () => {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) { textSize.value = ""; return; }

            const range = sel.getRangeAt(0);
            if (range.collapsed) { textSize.value = ""; return; }

            const node = range.startContainer.parentElement;
            if (!node) { textSize.value = ""; return; }

            const fontSize = parseFloat(window.getComputedStyle(node).fontSize);
            if (isNaN(fontSize)) { textSize.value = ""; return; }

            let optionExists = false;
            for (let i = 0; i < textSize.options.length; i++) {
                if (parseFloat(textSize.options[i].value) === fontSize) {
                    optionExists = true; break;
                }
            }

            if (!optionExists && fontSize >= 2 && fontSize <= 50) {
                const opt = document.createElement("option");
                opt.value = fontSize;
                opt.innerText = fontSize + "px";
                textSize.append(opt);
            }
            textSize.value = fontSize;
        });

        textSize.addEventListener("change", ($) => {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;

            const range = sel.getRangeAt(0);
            if (range.collapsed) return;

            const span = document.createElement("span");
            span.style.fontSize = $.target.value + "px";

            span.append(range.extractContents());
            range.insertNode(span);

            range.selectNodeContents(span);
            sel.removeAllRanges();
            sel.addRange(range);
        });
    });
})();