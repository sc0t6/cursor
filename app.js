// ============================================================
// SkyBlock Hub — Main Application
// ============================================================

// ---------- Utility ----------
function formatCoins(n) {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return n.toLocaleString();
}

function formatNumber(n) {
    return Number(n).toLocaleString();
}

// ---------- Navigation ----------
const sections = ["bazaar", "best-items", "top-resell", "money-methods", "mob-guide", "strategies"];
const navLinks = document.querySelectorAll(".nav-link, .mobile-link");
const mobileToggle = document.getElementById("mobileToggle");
const mobileMenu = document.getElementById("mobileMenu");

function switchSection(id) {
    sections.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.classList.toggle("hidden", s !== id);
    });
    navLinks.forEach(l => {
        l.classList.toggle("active", l.dataset.section === id);
    });
    mobileMenu.classList.remove("open");
    window.scrollTo({ top: 300, behavior: "smooth" });
}

navLinks.forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        switchSection(link.dataset.section);
    });
});

mobileToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
});

// ---------- BAZAAR TABLE ----------
const bazaarBody = document.getElementById("bazaarBody");
const bazaarSearch = document.getElementById("bazaarSearch");
const bazaarSort = document.getElementById("bazaarSort");
const filterTabs = document.querySelectorAll(".filter-tab");
let bazaarFilter = "all";

function renderBazaarTable() {
    const search = bazaarSearch.value.toLowerCase();
    const sort = bazaarSort.value;

    let items = BAZAAR_DATA.filter(item => {
        const matchCategory = bazaarFilter === "all" || item.category === bazaarFilter;
        const matchSearch = item.name.toLowerCase().includes(search);
        return matchCategory && matchSearch;
    });

    // Sort
    items.sort((a, b) => {
        switch (sort) {
            case "profit-desc": return b.margin - a.margin;
            case "profit-asc": return a.margin - b.margin;
            case "name-asc": return a.name.localeCompare(b.name);
            case "volume-desc": return b.volume - a.volume;
            default: return 0;
        }
    });

    bazaarBody.innerHTML = items.map(item => `
        <tr>
            <td>
                <div class="item-cell">
                    <img src="${item.icon}" alt="${item.name}" class="mc-icon" loading="lazy">
                    <span>${item.name}</span>
                </div>
            </td>
            <td>${formatCoins(item.buyPrice)}</td>
            <td>${formatCoins(item.sellPrice)}</td>
            <td class="profit-positive">+${formatCoins(item.margin)}</td>
            <td><span class="tag tag-green">${item.profitPct}%</span></td>
            <td>${formatNumber(item.volume)}</td>
        </tr>
    `).join("");
}

filterTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        filterTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        bazaarFilter = tab.dataset.filter;
        renderBazaarTable();
    });
});

bazaarSearch.addEventListener("input", renderBazaarTable);
bazaarSort.addEventListener("change", renderBazaarTable);
renderBazaarTable();

// ---------- BEST ITEMS (Budget Slider) ----------
const budgetSlider = document.getElementById("budgetSlider");
const budgetValue = document.getElementById("budgetValue");
const bestItemsGrid = document.getElementById("bestItemsGrid");
const presetBtns = document.querySelectorAll(".preset-btn");

function renderBestItems() {
    const budget = parseInt(budgetSlider.value);
    budgetValue.textContent = formatNumber(budget);

    // Filter items that can be bought within budget and sort by profit %
    let items = BAZAAR_DATA
        .filter(item => item.buyPrice <= budget)
        .sort((a, b) => parseFloat(b.profitPct) - parseFloat(a.profitPct))
        .slice(0, 24);

    bestItemsGrid.innerHTML = items.map(item => {
        const qty = Math.floor(budget / item.buyPrice);
        const totalProfit = qty * item.margin;
        return `
            <div class="item-card">
                <div class="item-card-header">
                    <img src="${item.icon}" alt="${item.name}" class="mc-icon" loading="lazy">
                    <div>
                        <div class="item-card-name">${item.name}</div>
                        <div class="item-card-category">${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</div>
                    </div>
                </div>
                <div class="item-card-stats">
                    <div class="item-stat">
                        <div class="item-stat-label">Buy Price</div>
                        <div class="item-stat-value">${formatCoins(item.buyPrice)}</div>
                    </div>
                    <div class="item-stat">
                        <div class="item-stat-label">Sell Price</div>
                        <div class="item-stat-value">${formatCoins(item.sellPrice)}</div>
                    </div>
                    <div class="item-stat">
                        <div class="item-stat-label">Margin</div>
                        <div class="item-stat-value profit-positive">+${formatCoins(item.margin)}</div>
                    </div>
                    <div class="item-stat">
                        <div class="item-stat-label">You Can Buy</div>
                        <div class="item-stat-value">${formatNumber(qty)}</div>
                    </div>
                </div>
                <div class="item-card-profit">
                    <span>Total Potential Profit</span>
                    <strong>+${formatCoins(totalProfit)} coins</strong>
                </div>
            </div>
        `;
    }).join("");

    if (items.length === 0) {
        bestItemsGrid.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px;grid-column:1/-1;">No items found within this budget. Try increasing your budget.</div>';
    }
}

budgetSlider.addEventListener("input", renderBestItems);

presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        presetBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        budgetSlider.value = btn.dataset.budget;
        renderBestItems();
    });
});

renderBestItems();

// ---------- TOP RESELL ----------
const resellGrid = document.getElementById("resellGrid");
const resellTabs = document.querySelectorAll(".resell-tab");
let activeResellTab = "bazaar-flip";

function renderResell() {
    const data = RESELL_DATA[activeResellTab] || [];

    resellGrid.innerHTML = data.map((item, i) => `
        <div class="resell-card">
            <div class="resell-rank">${i + 1}</div>
            <div class="resell-card-header">
                <img src="${item.icon}" alt="${item.name}" class="mc-icon" loading="lazy">
                <div>
                    <div class="resell-card-name">${item.name}</div>
                    <div class="resell-card-type">${item.type} — ${item.buyFrom} → ${item.sellTo}</div>
                </div>
            </div>
            <div class="resell-info">
                <div class="resell-info-item">
                    <div class="resell-info-label">Buy</div>
                    <div class="resell-info-value">${formatCoins(item.buy)}</div>
                </div>
                <div class="resell-info-item">
                    <div class="resell-info-label">Sell</div>
                    <div class="resell-info-value">${formatCoins(item.sell)}</div>
                </div>
                <div class="resell-info-item">
                    <div class="resell-info-label">Profit</div>
                    <div class="resell-info-value profit-positive">+${formatCoins(item.profit)}</div>
                </div>
            </div>
        </div>
    `).join("");
}

resellTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        resellTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        activeResellTab = tab.dataset.resell;
        renderResell();
    });
});

renderResell();

// ---------- MONEY METHODS ----------
const methodsGrid = document.getElementById("methodsGrid");
const methodFilterBtns = document.querySelectorAll(".method-filter-btn");
let methodFilter = "all";

function renderMoneyMethods() {
    let methods = MONEY_METHODS.filter(m => methodFilter === "all" || m.difficulty === methodFilter);

    methodsGrid.innerHTML = methods.map(method => `
        <div class="method-card" data-method-id="${method.id}">
            <div class="method-card-top">
                <img src="${method.icon}" alt="${method.name}" class="method-icon" loading="lazy">
                <div>
                    <div class="method-card-title">${method.name}</div>
                    <div class="method-card-subtitle">${method.subtitle}</div>
                </div>
            </div>
            <div class="method-meta">
                ${method.tags.map(t => `<span class="method-tag" style="color:${t.color};background:${t.bg}">${t.text}</span>`).join("")}
            </div>
            <div class="method-earning">
                <div class="method-earning-label">Estimated Earnings</div>
                <div class="method-earning-value">${method.earningRate}</div>
            </div>
            <div class="method-click-hint">Click for full guide</div>
        </div>
    `).join("");

    // Attach click events
    document.querySelectorAll(".method-card").forEach(card => {
        card.addEventListener("click", () => {
            const method = MONEY_METHODS.find(m => m.id === card.dataset.methodId);
            if (method) openMethodModal(method);
        });
    });
}

methodFilterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        methodFilterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        methodFilter = btn.dataset.difficulty;
        renderMoneyMethods();
    });
});

renderMoneyMethods();

// ---------- MOB GUIDE ----------
const mobGrid = document.getElementById("mobGrid");
const mobFilterBtns = document.querySelectorAll(".mob-filter-btn");
let mobFilter = "all";

function renderMobGuide() {
    let mobs = MOB_GUIDE.filter(m => mobFilter === "all" || m.location === mobFilter);

    mobGrid.innerHTML = mobs.map(mob => `
        <div class="mob-card" data-mob-name="${mob.name}">
            <div class="mob-card-header">
                <img src="${mob.icon}" alt="${mob.name}" class="mob-icon" loading="lazy">
                <div>
                    <div class="mob-card-name">${mob.name}</div>
                    <div class="mob-card-location">${mob.locationName}</div>
                </div>
            </div>
            <div class="mob-stats">
                <div class="mob-stat">
                    <div class="mob-stat-label">Health</div>
                    <div class="mob-stat-value">${mob.health}</div>
                </div>
                <div class="mob-stat">
                    <div class="mob-stat-label">Damage</div>
                    <div class="mob-stat-value">${mob.damage}</div>
                </div>
                <div class="mob-stat">
                    <div class="mob-stat-label">XP</div>
                    <div class="mob-stat-value">${mob.xp}</div>
                </div>
            </div>
            <div class="mob-difficulty">
                <span>Difficulty</span>
                <div class="difficulty-bar">
                    <div class="difficulty-fill" style="width:${mob.difficulty}%;background:${mob.difficultyColor}"></div>
                </div>
            </div>
            <div class="mob-click-hint">Click for kill guide</div>
        </div>
    `).join("");

    // Attach click events
    document.querySelectorAll(".mob-card").forEach(card => {
        card.addEventListener("click", () => {
            const mob = MOB_GUIDE.find(m => m.name === card.dataset.mobName);
            if (mob) openMobModal(mob);
        });
    });
}

mobFilterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        mobFilterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        mobFilter = btn.dataset.location;
        renderMobGuide();
    });
});

renderMobGuide();

// ---------- STRATEGIES ----------
const stratsGrid = document.getElementById("stratsGrid");

function renderStrategies() {
    stratsGrid.innerHTML = STRATEGIES_DATA.map(strat => `
        <div class="strat-card">
            <div class="strat-card-header">
                <div class="strat-icon-wrapper" style="background:${strat.iconBg};color:${strat.iconColor}">
                    ${strat.icon}
                </div>
                <div>
                    <div class="strat-card-title">${strat.title}</div>
                    <div class="strat-card-subtitle">${strat.subtitle}</div>
                </div>
            </div>
            <div class="strat-tier-list">
                ${strat.tiers.map(tier => `
                    <div class="strat-tier">
                        <div class="tier-label ${tier.label}">${tier.tier}</div>
                        <div class="tier-items">
                            ${tier.items.map(item => `<span class="tier-item">${item}</span>`).join("")}
                        </div>
                    </div>
                `).join("")}
            </div>
        </div>
    `).join("");
}

renderStrategies();

// ---------- MODALS ----------
const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");
const modalHeader = document.getElementById("modalHeader");
const modalBody = document.getElementById("modalBody");

function openMethodModal(method) {
    modalHeader.innerHTML = `
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;">
            <img src="${method.icon}" alt="${method.name}" class="mc-icon" style="width:48px;height:48px;" loading="lazy">
            <div>
                <h3>${method.name}</h3>
                <p style="margin:0">${method.subtitle} — <strong style="color:var(--green)">${method.earningRate}</strong></p>
            </div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${method.tags.map(t => `<span class="method-tag" style="color:${t.color};background:${t.bg}">${t.text}</span>`).join("")}
        </div>
    `;

    let bodyHTML = "";

    // YouTube video
    if (method.videoId) {
        bodyHTML += `
            <h4>Video Guide</h4>
            <iframe class="modal-video"
                src="https://www.youtube.com/embed/${method.videoId}"
                title="${method.name} Guide"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen></iframe>
        `;
    }

    // Text guide
    bodyHTML += `<h4>Overview</h4><p>${method.guide.summary}</p>`;
    bodyHTML += `<h4>Step-by-Step Guide</h4><ul>`;
    method.guide.steps.forEach(step => {
        bodyHTML += `<li>${step}</li>`;
    });
    bodyHTML += `</ul>`;

    // Recommended gear
    if (method.guide.gear && method.guide.gear.length > 0) {
        bodyHTML += `<h4>Recommended Gear</h4><div class="modal-gear-grid">`;
        method.guide.gear.forEach(g => {
            bodyHTML += `
                <div class="gear-item">
                    <img src="${g.icon}" alt="${g.name}" loading="lazy">
                    <span>${g.name}</span>
                </div>
            `;
        });
        bodyHTML += `</div>`;
    }

    modalBody.innerHTML = bodyHTML;
    modalOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
}

function openMobModal(mob) {
    modalHeader.innerHTML = `
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;">
            <img src="${mob.icon}" alt="${mob.name}" class="mob-icon" style="width:48px;height:48px;" loading="lazy">
            <div>
                <h3>${mob.name}</h3>
                <p style="margin:0">${mob.locationName}</p>
            </div>
        </div>
        <div class="mob-stats" style="margin-top:12px;">
            <div class="mob-stat">
                <div class="mob-stat-label">Health</div>
                <div class="mob-stat-value">${mob.health}</div>
            </div>
            <div class="mob-stat">
                <div class="mob-stat-label">Damage</div>
                <div class="mob-stat-value">${mob.damage}</div>
            </div>
            <div class="mob-stat">
                <div class="mob-stat-label">XP</div>
                <div class="mob-stat-value">${mob.xp}</div>
            </div>
        </div>
    `;

    let bodyHTML = `<h4>Overview</h4><p>${mob.guide.summary}</p>`;
    bodyHTML += `<h4>Tips & Strategy</h4><ul>`;
    mob.guide.tips.forEach(tip => {
        bodyHTML += `<li>${tip}</li>`;
    });
    bodyHTML += `</ul>`;

    if (mob.guide.recommendedGear && mob.guide.recommendedGear.length > 0) {
        bodyHTML += `<h4>Recommended Gear</h4><div class="modal-gear-grid">`;
        mob.guide.recommendedGear.forEach(g => {
            bodyHTML += `
                <div class="gear-item">
                    <img src="${g.icon}" alt="${g.name}" loading="lazy">
                    <span>${g.name}</span>
                </div>
            `;
        });
        bodyHTML += `</div>`;
    }

    // Difficulty indicator
    bodyHTML += `
        <h4>Difficulty</h4>
        <div class="mob-difficulty" style="margin-top:8px;">
            <span>${mob.difficulty}%</span>
            <div class="difficulty-bar">
                <div class="difficulty-fill" style="width:${mob.difficulty}%;background:${mob.difficultyColor}"></div>
            </div>
        </div>
    `;

    modalBody.innerHTML = bodyHTML;
    modalOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    modalOverlay.classList.remove("open");
    document.body.style.overflow = "";
    // Stop any YouTube videos
    const iframes = modalBody.querySelectorAll("iframe");
    iframes.forEach(iframe => {
        iframe.src = iframe.src; // Reset src to stop playback
    });
}

modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", e => {
    if (e.target === modalOverlay) closeModal();
});

document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
});

// ---------- Random slight variation in hero stats (cosmetic) ----------
(function animateStats() {
    // Just set static values on load for a clean look
    document.getElementById("totalItems").textContent = BAZAAR_DATA.length * 15;
    document.getElementById("methodCount").textContent = MONEY_METHODS.length;
})();
