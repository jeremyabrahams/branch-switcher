// Adds a "View on <OTHER BRANCH>" button to the transact-panel on BiblioCommons
// book detail pages, linking to the same record on the sibling GRPL/KDL subdomain.

(function () {
  const BRANCHES = {
    "kdl.bibliocommons.com": { otherHost: "grpl.bibliocommons.com", otherLabel: "GRPL" },
    "grpl.bibliocommons.com": { otherHost: "kdl.bibliocommons.com", otherLabel: "KDL" },
  };

  const BUTTON_ID = "bc-branch-switcher-button";
  const STYLE_ID = "bc-branch-switcher-style";
  const SEARCH_LINK_WRAPPER_ID = "bc-branch-switcher-search-link";
  const PLACE_HOLD_BUTTON_CLASSES =
    "cp-button cp-solid-button cp-transactional-solid-button button--block";

  function isRecordPage() {
    return /^\/v2\/record\//.test(window.location.pathname);
  }

  function isSearchPage() {
    return /^\/v2\/search/.test(window.location.pathname);
  }

  function ensureHoverStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    // Matches the "For Later" button's :hover state.
    style.textContent = `
      #${BUTTON_ID}:hover {
        background-color: #f0f0f0 !important;
        border-color: #949494 !important;
        color: #474747 !important;
      }
    `;
    document.head.appendChild(style);
  }

  function desiredHref(branch) {
    return `https://${branch.otherHost}${window.location.pathname}${window.location.search}`;
  }

  function createButton(branch) {
    const link = document.createElement("a");
    link.id = BUTTON_ID;
    link.className = PLACE_HOLD_BUTTON_CLASSES;
    link.href = desiredHref(branch);
    link.textContent = `View on ${branch.otherLabel} ❤️`;

    // Same shape/spacing/font as the Place Hold button, but white bg / gray text,
    // with the gray border/margin used by the "For Later" button above it.
    link.style.backgroundColor = "#ffffff";
    link.style.color = "#474747";
    link.style.borderColor = "rgb(148, 148, 148)";
    link.style.textDecoration = "none";
    link.style.marginTop = "16px";

    return link;
  }

  function injectButton() {
    const branch = BRANCHES[window.location.hostname];
    if (!branch || !isRecordPage()) return;

    ensureHoverStyle();

    // Anchor on the "For Later" shelf button's section rather than the hold
    // button, since hold/borrow controls don't render when the title isn't
    // available at this branch, but the shelf button always does.
    const shelfButton = document.querySelector(".cp-shelf-actions-button");
    const panel = shelfButton ? shelfButton.closest(".panel-section") : null;
    if (!panel) return;

    const existing = document.getElementById(BUTTON_ID);
    const href = desiredHref(branch);

    if (existing) {
      if (existing.parentElement === panel && existing.getAttribute("href") === href) {
        if (panel.lastElementChild !== existing) {
          panel.appendChild(existing);
        }
        return;
      }
      existing.remove();
    }

    panel.appendChild(createButton(branch));
  }

  function injectSearchLink() {
    const branch = BRANCHES[window.location.hostname];
    if (!branch || !isSearchPage()) return;

    const titleBlock = document.querySelector(".search-title-block");
    if (!titleBlock) return;

    const row = titleBlock.parentElement;
    const href = desiredHref(branch);
    const existing = document.getElementById(SEARCH_LINK_WRAPPER_ID);

    if (existing) {
      const link = existing.querySelector("a");
      if (
        existing.nextElementSibling === titleBlock &&
        link &&
        link.getAttribute("href") === href
      ) {
        return;
      }
      existing.remove();
    }

    // Match the row's grid classes so it lays out like the other full-width
    // rows here (the row is a flex container of "col-12 col-xs-12" items).
    const wrapper = document.createElement("div");
    wrapper.id = SEARCH_LINK_WRAPPER_ID;
    wrapper.className = "col-12 col-xs-12";
    wrapper.style.textAlign = "right";

    const link = document.createElement("a");
    link.href = href;
    link.textContent = `View on ${branch.otherLabel} ❤️`;
    wrapper.appendChild(link);

    row.insertBefore(wrapper, titleBlock);
  }

  function injectAll() {
    injectButton();
    injectSearchLink();
  }

  const observer = new MutationObserver(injectAll);
  observer.observe(document.body, { childList: true, subtree: true });

  injectAll();
})();
