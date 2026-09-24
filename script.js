/* =====================================================
   TOKO BUKU PESANTREN
   SCRIPT.JS - FINAL FIX
   Digital / Cetak / Digital + Cetak
===================================================== */


/* =====================================================
   CONFIG
===================================================== */

const WHATSAPP_NUMBER = "6282162666244";

const STORAGE_KEY = "pesantrenBooks";
const CART_STORAGE_KEY = "pesantrenCart";


/* =====================================================
   STATE
===================================================== */

let books = [];
let cart = [];
let selectedCategory = "Semua";


/* =====================================================
   ELEMENTS
===================================================== */

const bookGrid =
  document.getElementById("bookGrid");

const categoryList =
  document.getElementById("categoryList");

const searchInput =
  document.getElementById("searchInput");

const cartButton =
  document.getElementById("cartButton");

const cartCount =
  document.getElementById("cartCount");

const cartPanel =
  document.getElementById("cartPanel");

const cartOverlay =
  document.getElementById("cartOverlay");

const closeCart =
  document.getElementById("closeCart");

const cartItems =
  document.getElementById("cartItems");

const cartTotal =
  document.getElementById("cartTotal");

const checkoutButton =
  document.getElementById("checkoutButton");


/* =====================================================
   CHECKOUT ELEMENTS
===================================================== */

const checkoutModal =
  document.getElementById("checkoutModal");

const closeCheckout =
  document.getElementById("closeCheckout");

const checkoutForm =
  document.getElementById("checkoutForm");

const deliveryMethod =
  document.getElementById("deliveryMethod");

const addressGroup =
  document.getElementById("addressGroup");

const customerAddress =
  document.getElementById("customerAddress");

const customerName =
  document.getElementById("customerName");

const customerPhone =
  document.getElementById("customerPhone");

const customerNote =
  document.getElementById("customerNote");

const checkoutBookCount =
  document.getElementById("checkoutBookCount");

const checkoutGrandTotal =
  document.getElementById("checkoutGrandTotal");


/* =====================================================
   FORMAT PRICE
===================================================== */

function formatPrice(price) {

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }
  ).format(Number(price) || 0);

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =====================================================
   NORMALIZE BOOK
===================================================== */

function normalizeBook(book) {

  if (!book) {
    return null;
  }


  const oldPrice =
    Number(book.price) || 0;

  const oldStock =
    Number(book.stock) || 0;


  let productType =
    String(
      book.productType || ""
    )
      .toLowerCase()
      .trim();


  /*
    Kompatibilitas buku lama.
  */

  if (
    productType !== "digital" &&
    productType !== "print" &&
    productType !== "both"
  ) {

    if (
      book.digitalLink ||
      book.digitalPrice !== undefined
    ) {

      productType = "digital";

    } else {

      productType = "print";

    }

  }


  let digitalPrice =
    Number(book.digitalPrice);


  if (
    !Number.isFinite(digitalPrice)
  ) {

    digitalPrice =
      productType === "digital"
        ? oldPrice
        : 0;

  }


  let printPrice =
    Number(book.printPrice);


  if (
    !Number.isFinite(printPrice)
  ) {

    printPrice =
      productType !== "digital"
        ? oldPrice
        : 0;

  }


  let printStock =
    Number(book.printStock);


  if (
    !Number.isFinite(printStock)
  ) {

    printStock =
      productType !== "digital"
        ? oldStock
        : 0;

  }


  return {

    ...book,

    id: book.id,

    title:
      String(
        book.title || "Tanpa Judul"
      ),

    author:
      String(
        book.author || "Penulis"
      ),

    category:
      String(
        book.category || "Buku"
      ),

    description:
      String(
        book.description || ""
      ),

    cover:
      book.cover || "📖",

    productType,

    digitalPrice,

    digitalLink:
      String(
        book.digitalLink || ""
      ),

    printPrice,

    printStock,

    /*
      Field lama tetap disediakan
      supaya kompatibel.
    */

    price:
      productType === "digital"
        ? digitalPrice
        : printPrice,

    stock:
      productType === "digital"
        ? 0
        : printStock

  };

}


/* =====================================================
   LOAD BOOKS
===================================================== */

function loadBooks() {

  const saved =
    localStorage.getItem(
      STORAGE_KEY
    );


  if (!saved) {

    books = [];

    return;

  }


  try {

    const parsed =
      JSON.parse(saved);


    if (
      !Array.isArray(parsed)
    ) {

      books = [];

      return;

    }


    books =
      parsed
        .map(normalizeBook)
        .filter(Boolean);

  } catch (error) {

    console.error(
      "Data buku rusak:",
      error
    );

    books = [];

  }

}


/* =====================================================
   GET BOOK
===================================================== */

function getBook(id) {

  return books.find(
    book =>
      String(book.id) ===
      String(id)
  );

}


/* =====================================================
   GET PRODUCT TYPE
===================================================== */

function getProductType(book) {

  return (
    book?.productType ||
    "print"
  );

}


/* =====================================================
   GET PRICE
===================================================== */

function getVariantPrice(
  book,
  variant
) {

  if (
    variant === "digital"
  ) {

    return (
      Number(
        book.digitalPrice
      ) || 0
    );

  }


  return (
    Number(
      book.printPrice
    ) || 0
  );

}


/* =====================================================
   CHECK AVAILABILITY
===================================================== */

function isVariantAvailable(
  book,
  variant
) {

  if (!book) {
    return false;
  }


  /*
    Digital tidak menggunakan stok.
    Yang dicek adalah file/link digital.
  */

  if (
    variant === "digital"
  ) {

    return Boolean(
      book.digitalLink
    );

  }


  /*
    Cetak menggunakan stok.
  */

  return (
    Number(book.printStock) > 0
  );

}


/* =====================================================
   CART KEY
===================================================== */

function getCartKey(
  id,
  variant
) {

  return (
    String(id) +
    "__" +
    String(variant)
  );

}


/* =====================================================
   FIND CART ITEM
===================================================== */

function findCartItem(
  id,
  variant
) {

  return cart.find(
    item =>
      String(item.id) ===
        String(id) &&
      item.variant ===
        variant
  );

}


/* =====================================================
   LOAD CART
===================================================== */

function loadCart() {

  const saved =
    localStorage.getItem(
      CART_STORAGE_KEY
    );


  if (!saved) {

    cart = [];

    return;

  }


  try {

    const parsed =
      JSON.parse(saved);


    if (
      !Array.isArray(parsed)
    ) {

      cart = [];

      return;

    }


    cart =
      parsed
        .map(item => {

          const book =
            getBook(item.id);


          if (!book) {
            return null;
          }


          let variant =
            item.variant;


          /*
            Keranjang lama belum punya variant.
          */

          if (
            variant !== "digital" &&
            variant !== "print"
          ) {

            if (
              book.productType ===
              "digital"
            ) {

              variant =
                "digital";

            } else {

              variant =
                "print";

            }

          }


          return {

            id: book.id,

            variant,

            quantity:
              Math.max(
                1,
                Number(
                  item.quantity
                ) || 1
              )

          };

        })
        .filter(Boolean);


  } catch (error) {

    console.error(
      "Keranjang rusak:",
      error
    );

    cart = [];

  }

}


/* =====================================================
   SAVE CART
===================================================== */

function saveCart() {

  localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify(cart)
  );

}


/* =====================================================
   CATEGORIES
===================================================== */

function renderCategories() {

  if (!categoryList) {
    return;
  }


  const categories = [

    "Semua",

    ...new Set(

      books
        .map(
          book =>
            book.category
        )
        .filter(Boolean)

    )

  ];


  categoryList.innerHTML =
    categories
      .map(category => {

        return `

          <button
            class="
              category-button
              ${
                category ===
                selectedCategory
                  ? "active"
                  : ""
              }
            "
            data-category="${escapeHTML(
              category
            )}"
          >

            ${escapeHTML(
              category
            )}

          </button>

        `;

      })
      .join("");


  document
    .querySelectorAll(
      ".category-button"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        function () {

          selectedCategory =
            button.dataset.category;

          renderCategories();

          renderBooks();

        }
      );

    });

}


/* =====================================================
   RENDER BOOKS
===================================================== */

function renderBooks() {

  if (!bookGrid) {
    return;
  }


  const search =
    searchInput
      ? searchInput.value
          .toLowerCase()
          .trim()
      : "";


  const filtered =
    books.filter(book => {

      const title =
        String(
          book.title || ""
        )
          .toLowerCase();


      const author =
        String(
          book.author || ""
        )
          .toLowerCase();


      const matchesSearch =
        !search ||
        title.includes(search) ||
        author.includes(search);


      const matchesCategory =
        selectedCategory ===
          "Semua" ||
        book.category ===
          selectedCategory;


      return (
        matchesSearch &&
        matchesCategory
      );

    });


  if (
    filtered.length === 0
  ) {

    bookGrid.innerHTML = `

      <div class="empty-books">

        <div
          style="
            font-size:50px;
          "
        >
          📚
        </div>

        <h3
          style="
            margin-top:12px;
          "
        >
          Buku belum ditemukan
        </h3>

        <p
          style="
            margin-top:7px;
          "
        >
          Coba gunakan kata pencarian lain.
        </p>

      </div>

    `;

    return;

  }


  bookGrid.innerHTML =
    filtered
      .map(
        book =>
          createBookCard(book)
      )
      .join("");


  document
    .querySelectorAll(
      "[data-add-cart]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        function () {

          addToCart(
            button.dataset.addCart
          );

        }
      );

    });

}


/* =====================================================
   BOOK CARD
   PENTING:
   Struktur ini dibuat mengikuti kartu asli.
   Tidak ada tulisan besar di area cover.
===================================================== */

function createBookCard(book) {

  let cover = "📖";


  /*
    Cover gambar.
  */

  if (
    book.cover &&
    String(book.cover)
      .startsWith("data:")
  ) {

    cover = `

      <img
        src="${book.cover}"
        alt="${escapeHTML(
          book.title
        )}"
      >

    `;

  }

  /*
    Cover berupa emoji/text.
  */

  else if (
    book.cover
  ) {

    cover =
      escapeHTML(
        book.cover
      );

  }


  const type =
    getProductType(book);


  let canBuy = false;

  let buttonText =
    "🛒 Beli";


  /*
    DIGITAL
  */

  if (
    type === "digital"
  ) {

    canBuy =
      isVariantAvailable(
        book,
        "digital"
      );

  }


  /*
    PRINT
  */

  else if (
    type === "print"
  ) {

    canBuy =
      isVariantAvailable(
        book,
        "print"
      );

  }


  /*
    BOTH
  */

  else if (
    type === "both"
  ) {

    canBuy =
      isVariantAvailable(
        book,
        "digital"
      ) ||
      isVariantAvailable(
        book,
        "print"
      );

  }


  if (!canBuy) {

    buttonText =
      "Habis";

  }


  /*
    Harga.

    Dibuat tetap sederhana supaya
    tampilan tidak rusak.
  */

  let priceHTML = "";


  if (
    type === "both"
  ) {

    priceHTML = `

      <span
        style="
          display:block;
          font-size:14px;
          line-height:1.45;
        "
      >

        Digital:
        ${formatPrice(
          book.digitalPrice
        )}

      </span>

      <span
        style="
          display:block;
          font-size:14px;
          line-height:1.45;
        "
      >

        Cetak:
        ${formatPrice(
          book.printPrice
        )}

      </span>

    `;

  }


  else if (
    type === "digital"
  ) {

    priceHTML =
      formatPrice(
        book.digitalPrice
      );

  }


  else {

    priceHTML =
      formatPrice(
        book.printPrice
      );

  }


  return `

    <article class="book-card">

      <div class="book-cover">

        ${cover}

      </div>


      <div class="book-info">

        <div class="book-category">

          ${escapeHTML(
            book.category ||
            "Buku"
          )}

        </div>


        <h3 class="book-title">

          ${escapeHTML(
            book.title
          )}

        </h3>


        <div class="book-author">

          ${escapeHTML(
            book.author ||
            "Penulis"
          )}

        </div>


        <div class="book-bottom">

          <strong class="book-price">

            ${priceHTML}

          </strong>


          <button
            class="add-cart"
            data-add-cart="${escapeHTML(
              book.id
            )}"
            ${
              !canBuy
                ? "disabled"
                : ""
            }
          >

            ${buttonText}

          </button>

        </div>

      </div>

    </article>

  `;

}


/* =====================================================
   ADD TO CART
===================================================== */

function addToCart(id) {

  const book =
    getBook(id);


  if (!book) {

    alert(
      "Buku tidak ditemukan."
    );

    return;

  }


  const type =
    getProductType(book);


  /*
    DIGITAL
  */

  if (
    type === "digital"
  ) {

    if (
      !isVariantAvailable(
        book,
        "digital"
      )
    ) {

      alert(
        "File digital buku ini belum tersedia."
      );

      return;

    }


    addVariantToCart(
      book,
      "digital"
    );

    return;

  }


  /*
    PRINT
  */

  if (
    type === "print"
  ) {

    if (
      !isVariantAvailable(
        book,
        "print"
      )
    ) {

      alert(
        "Maaf, stok buku ini sedang habis."
      );

      return;

    }


    addVariantToCart(
      book,
      "print"
    );

    return;

  }


  /*
    BOTH
  */

  if (
    type === "both"
  ) {

    showVariantSelector(
      book
    );

  }

}


/* =====================================================
   ADD VARIANT
===================================================== */

function addVariantToCart(
  book,
  variant
) {

  if (
    !isVariantAvailable(
      book,
      variant
    )
  ) {

    return;

  }


  const existing =
    findCartItem(
      book.id,
      variant
    );


  if (existing) {

    /*
      Digital tidak dibatasi stok.
    */

    if (
      variant === "digital"
    ) {

      existing.quantity++;

    }

    /*
      Cetak dibatasi stok.
    */

    else {

      const stock =
        Number(
          book.printStock
        ) || 0;


      if (
        existing.quantity >=
        stock
      ) {

        alert(
          "Jumlah sudah mencapai stok yang tersedia."
        );

        return;

      }


      existing.quantity++;

    }

  }

  else {

    cart.push({

      id: book.id,

      variant,

      quantity: 1

    });

  }


  saveCart();

  renderCart();

  openCart();

}


/* =====================================================
   VARIANT MODAL
===================================================== */

function showVariantSelector(
  book
) {

  let modal =
    document.getElementById(
      "bookVariantModal"
    );


  if (!modal) {

    modal =
      document.createElement(
        "div"
      );

    modal.id =
      "bookVariantModal";


    modal.innerHTML = `

      <div
        id="bookVariantOverlay"
        style="
          position:fixed;
          inset:0;
          background:rgba(0,0,0,.55);
          z-index:9998;
        "
      ></div>


      <div
        style="
          position:fixed;
          left:50%;
          top:50%;
          transform:translate(-50%,-50%);
          width:min(92%,420px);
          background:#fff;
          border-radius:18px;
          padding:22px;
          z-index:9999;
          box-shadow:0 20px 60px rgba(0,0,0,.3);
        "
      >

        <button
          id="closeBookVariant"
          type="button"
          style="
            position:absolute;
            right:14px;
            top:8px;
            border:0;
            background:none;
            font-size:28px;
            cursor:pointer;
          "
        >
          ×
        </button>


        <h3
          id="variantBookTitle"
          style="
            margin:0 30px 18px 0;
          "
        ></h3>


        <p
          style="
            margin:0 0 14px;
            color:#666;
          "
        >
          Pilih versi buku:
        </p>


        <div
          id="variantButtons"
          style="
            display:flex;
            flex-direction:column;
            gap:10px;
          "
        ></div>

      </div>

    `;


    document.body.appendChild(
      modal
    );


    document
      .getElementById(
        "closeBookVariant"
      )
      .addEventListener(
        "click",
        closeVariantSelector
      );


    document
      .getElementById(
        "bookVariantOverlay"
      )
      .addEventListener(
        "click",
        closeVariantSelector
      );

  }


  document
    .getElementById(
      "variantBookTitle"
    )
    .textContent =
      book.title;


  const buttons =
    document.getElementById(
      "variantButtons"
    );


  const digitalAvailable =
    isVariantAvailable(
      book,
      "digital"
    );


  const printAvailable =
    isVariantAvailable(
      book,
      "print"
    );


  buttons.innerHTML = `

    <button
      type="button"
      data-variant="digital"
      ${
        !digitalAvailable
          ? "disabled"
          : ""
      }
      style="
        width:100%;
        padding:14px;
        border:1px solid #ddd;
        border-radius:12px;
        background:#f8f8f8;
        text-align:left;
        cursor:pointer;
      "
    >

      <strong>
        📱 Digital
      </strong>

      <br>

      <span>
        ${
          digitalAvailable
            ? formatPrice(
                book.digitalPrice
              )
            : "Tidak tersedia"
        }
      </span>

    </button>


    <button
      type="button"
      data-variant="print"
      ${
        !printAvailable
          ? "disabled"
          : ""
      }
      style="
        width:100%;
        padding:14px;
        border:1px solid #ddd;
        border-radius:12px;
        background:#f8f8f8;
        text-align:left;
        cursor:pointer;
      "
    >

      <strong>
        📚 Cetak
      </strong>

      <br>

      <span>
        ${
          printAvailable
            ? `${formatPrice(
                book.printPrice
              )} • Stok ${
                book.printStock
              }`
            : "Stok habis"
        }
      </span>

    </button>

  `;


  buttons
    .querySelectorAll(
      "[data-variant]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        function () {

          const variant =
            button.dataset.variant;


          if (
            !isVariantAvailable(
              book,
              variant
            )
          ) {

            return;

          }


          closeVariantSelector();


          addVariantToCart(
            book,
            variant
          );

        }
      );

    });


  modal.style.display =
    "block";

}


/* =====================================================
   CLOSE VARIANT
===================================================== */

function closeVariantSelector() {

  const modal =
    document.getElementById(
      "bookVariantModal"
    );


  if (!modal) {
    return;
  }


  modal.style.display =
    "none";

}


/* =====================================================
   CHANGE QUANTITY
===================================================== */

function changeQuantity(
  id,
  variant,
  change
) {

  const item =
    findCartItem(
      id,
      variant
    );


  const book =
    getBook(id);


  if (
    !item ||
    !book
  ) {

    return;

  }


  const newQuantity =
    item.quantity +
    change;


  if (
    newQuantity <= 0
  ) {

    cart =
      cart.filter(
        cartItem =>
          !(
            String(
              cartItem.id
            ) ===
              String(id) &&
            cartItem.variant ===
              variant
          )
      );

  }


  else if (
    variant === "digital"
  ) {

    item.quantity =
      newQuantity;

  }


  else {

    const stock =
      Number(
        book.printStock
      ) || 0;


    if (
      newQuantity <=
      stock
    ) {

      item.quantity =
        newQuantity;

    } else {

      alert(
        "Jumlah sudah mencapai stok."
      );

    }

  }


  saveCart();

  renderCart();

}


/* =====================================================
   REMOVE FROM CART
===================================================== */

function removeFromCart(
  id,
  variant
) {

  cart =
    cart.filter(
      item =>
        !(
          String(item.id) ===
            String(id) &&
          item.variant ===
            variant
        )
    );


  saveCart();

  renderCart();

}


/* =====================================================
   RENDER CART
===================================================== */

function renderCart() {

  if (!cartItems) {
    return;
  }


  if (
    cart.length === 0
  ) {

    cartItems.innerHTML = `

      <div
        style="
          padding:60px 15px;
          text-align:center;
          color:#777;
        "
      >

        <div
          style="
            font-size:50px;
          "
        >
          🛒
        </div>

        <h3
          style="
            margin-top:12px;
          "
        >
          Keranjang masih kosong
        </h3>

        <p
          style="
            margin-top:7px;
          "
        >
          Pilih buku yang ingin dibeli.
        </p>

      </div>

    `;


    cartTotal.textContent =
      "Rp0";


    cartCount.textContent =
      "0";


    return;

  }


  let total = 0;
  let totalItems = 0;


  cartItems.innerHTML =
    cart
      .map(item => {

        const book =
          getBook(item.id);


        if (!book) {
          return "";
        }


        const variant =
          item.variant ===
          "digital"
            ? "digital"
            : "print";


        const price =
          getVariantPrice(
            book,
            variant
          );


        const subtotal =
          price *
          item.quantity;


        total +=
          subtotal;


        totalItems +=
          item.quantity;


        let cover =
          "📖";


        if (
          book.cover &&
          String(book.cover)
            .startsWith("data:")
        ) {

          cover = `

            <img
              src="${book.cover}"
              alt=""
            >

          `;

        }

        else if (
          book.cover
        ) {

          cover =
            escapeHTML(
              book.cover
            );

        }


        const variantName =
          variant === "digital"
            ? "📱 Digital"
            : "📚 Cetak";


        return `

          <div class="cart-item">

            <div class="cart-item-cover">

              ${cover}

            </div>


            <div>

              <h3>

                ${escapeHTML(
                  book.title
                )}

              </h3>


              <div
                style="
                  font-size:13px;
                  color:#666;
                  margin:4px 0;
                "
              >

                ${variantName}

              </div>


              <div class="cart-item-price">

                ${formatPrice(
                  price
                )}

              </div>


              <div class="quantity">

                <button
                  data-minus-id="${escapeHTML(
                    book.id
                  )}"
                  data-minus-variant="${variant}"
                >
                  −
                </button>


                <strong>

                  ${item.quantity}

                </strong>


                <button
                  data-plus-id="${escapeHTML(
                    book.id
                  )}"
                  data-plus-variant="${variant}"
                >
                  +
                </button>

              </div>

            </div>


            <button
              class="remove-item"
              data-remove-id="${escapeHTML(
                book.id
              )}"
              data-remove-variant="${variant}"
            >

              Hapus

            </button>

          </div>

        `;

      })
      .join("");


  cartTotal.textContent =
    formatPrice(total);


  cartCount.textContent =
    totalItems;


  document
    .querySelectorAll(
      "[data-minus-id]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        function () {

          changeQuantity(

            button.dataset.minusId,

            button.dataset.minusVariant,

            -1

          );

        }
      );

    });


  document
    .querySelectorAll(
      "[data-plus-id]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        function () {

          changeQuantity(

            button.dataset.plusId,

            button.dataset.plusVariant,

            1

          );

        }
      );

    });


  document
    .querySelectorAll(
      "[data-remove-id]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        function () {

          removeFromCart(

            button.dataset.removeId,

            button.dataset.removeVariant

          );

        }
      );

    });

}


/* =====================================================
   OPEN CART
===================================================== */

function openCart() {

  if (!cartPanel) {
    return;
  }


  cartPanel.classList.add(
    "open"
  );


  if (cartOverlay) {

    cartOverlay.classList.add(
      "show"
    );

  }


  document.body.style.overflow =
    "hidden";

}


/* =====================================================
   CLOSE CART
===================================================== */

function closeCartPanel() {

  if (cartPanel) {

    cartPanel.classList.remove(
      "open"
    );

  }


  if (cartOverlay) {

    cartOverlay.classList.remove(
      "show"
    );

  }


  document.body.style.overflow =
    "";

}


/* =====================================================
   CHECK PRINT ITEMS
===================================================== */

function cartHasPrintItems() {

  return cart.some(
    item =>
      item.variant ===
      "print"
  );

}


/* =====================================================
   CHECKOUT
===================================================== */

function checkout() {

  if (
    cart.length === 0
  ) {

    alert(
      "Keranjang masih kosong."
    );

    return;

  }


  let total = 0;
  let totalItems = 0;


  cart.forEach(item => {

    const book =
      getBook(item.id);


    if (!book) {
      return;
    }


    const price =
      getVariantPrice(
        book,
        item.variant
      );


    total +=
      price *
      item.quantity;


    totalItems +=
      item.quantity;

  });


  if (checkoutBookCount) {

    checkoutBookCount.textContent =
      totalItems;

  }


  if (checkoutGrandTotal) {

    checkoutGrandTotal.textContent =
      formatPrice(total);

  }


  /*
    Kalau semuanya DIGITAL,
    tidak perlu alamat.
  */

  const needsShipping =
    cartHasPrintItems();


  if (
    deliveryMethod &&
    addressGroup &&
    customerAddress
  ) {

    if (needsShipping) {

      deliveryMethod.disabled =
        false;

      deliveryMethod.required =
        true;

    }

    else {

      deliveryMethod.value =
        "";

      deliveryMethod.required =
        false;

      deliveryMethod.disabled =
        true;

      addressGroup.classList.remove(
        "show"
      );

      customerAddress.required =
        false;

      customerAddress.value =
        "";

    }

  }


  if (checkoutModal) {

    checkoutModal.classList.add(
      "show"
    );

  }


  document.body.style.overflow =
    "hidden";

}


/* =====================================================
   CLOSE CHECKOUT
===================================================== */

if (closeCheckout) {

  closeCheckout.addEventListener(
    "click",
    function () {

      checkoutModal.classList.remove(
        "show"
      );

      document.body.style.overflow =
        "";

    }
  );

}


/* =====================================================
   DELIVERY METHOD
===================================================== */

if (deliveryMethod) {

  deliveryMethod.addEventListener(
    "change",
    function () {

      if (
        deliveryMethod.value ===
        "Dikirim"
      ) {

        addressGroup.classList.add(
          "show"
        );

        customerAddress.required =
          true;

      }

      else {

        addressGroup.classList.remove(
          "show"
        );

        customerAddress.required =
          false;

        customerAddress.value =
          "";

      }

    }
  );

}


/* =====================================================
   SUBMIT CHECKOUT
===================================================== */

if (checkoutForm) {

  checkoutForm.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();


      if (
        cart.length === 0
      ) {

        alert(
          "Keranjang kosong."
        );

        return;

      }


      const name =
        customerName
          ? customerName.value.trim()
          : "";


      const phone =
        customerPhone
          ? customerPhone.value.trim()
          : "";


      const needsShipping =
        cartHasPrintItems();


      const delivery =
        needsShipping &&
        deliveryMethod
          ? deliveryMethod.value
          : "Digital";


      const address =
        customerAddress
          ? customerAddress.value.trim()
          : "";


      const note =
        customerNote
          ? customerNote.value.trim()
          : "";


      if (
        !name ||
        !phone
      ) {

        alert(
          "Mohon lengkapi nama dan nomor WhatsApp."
        );

        return;

      }


      if (
        needsShipping &&
        !delivery
      ) {

        alert(
          "Mohon pilih metode pengiriman."
        );

        return;

      }


      if (
        needsShipping &&
        delivery === "Dikirim" &&
        !address
      ) {

        alert(
          "Mohon masukkan alamat pengiriman."
        );

        return;

      }


      /*
        WHATSAPP MESSAGE
      */

      let message =
        "Assalamu'alaikum, saya ingin memesan buku.%0A%0A";


      message +=
        "👤 DATA PEMBELI%0A";


      message +=
        `Nama: ${encodeURIComponent(
          name
        )}%0A`;


      message +=
        `WhatsApp: ${encodeURIComponent(
          phone
        )}%0A`;


      message +=
        `Pengiriman: ${encodeURIComponent(
          delivery
        )}%0A`;


      if (
        delivery === "Dikirim"
      ) {

        message +=
          `Alamat: ${encodeURIComponent(
            address
          )}%0A`;

      }


      message +=
        "%0A📚 DAFTAR PESANAN%0A";


      let total = 0;
      let totalItems = 0;


      cart.forEach(
        (item, index) => {

          const book =
            getBook(item.id);


          if (!book) {
            return;
          }


          const variant =
            item.variant ===
            "digital"
              ? "digital"
              : "print";


          const variantName =
            variant ===
            "digital"
              ? "Digital"
              : "Cetak";


          const price =
            getVariantPrice(
              book,
              variant
            );


          const subtotal =
            price *
            item.quantity;


          total +=
            subtotal;


          totalItems +=
            item.quantity;


          message +=
            `%0A${index + 1}. ${encodeURIComponent(
              book.title
            )}%0A`;


          message +=
            `Versi: ${encodeURIComponent(
              variantName
            )}%0A`;


          message +=
            `Jumlah: ${item.quantity}%0A`;


          message +=
            `Harga: ${encodeURIComponent(
              formatPrice(price)
            )}%0A`;


          message +=
            `Subtotal: ${encodeURIComponent(
              formatPrice(subtotal)
            )}%0A`;

        }
      );


      message +=
        "%0A💰 TOTAL PESANAN%0A";


      message +=
        `Jumlah buku: ${totalItems}%0A`;


      message +=
        `Total: ${encodeURIComponent(
          formatPrice(total)
        )}%0A`;


      if (note) {

        message +=
          `%0A📝 Catatan:%0A${encodeURIComponent(
            note
          )}%0A`;

      }


      message +=
        "%0AMohon informasi mengenai pembayaran dan pengiriman.%0A%0A";


      message +=
        "Terima kasih.";


      const whatsappURL =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;


      window.open(
        whatsappURL,
        "_blank"
      );


      checkoutModal.classList.remove(
        "show"
      );


      document.body.style.overflow =
        "";

    }
  );

}


/* =====================================================
   SEARCH
===================================================== */

if (searchInput) {

  searchInput.addEventListener(
    "input",
    renderBooks
  );

}


/* =====================================================
   CART EVENTS
===================================================== */

if (cartButton) {

  cartButton.addEventListener(
    "click",
    openCart
  );

}


if (closeCart) {

  closeCart.addEventListener(
    "click",
    closeCartPanel
  );

}


if (cartOverlay) {

  cartOverlay.addEventListener(
    "click",
    closeCartPanel
  );

}


if (checkoutButton) {

  checkoutButton.addEventListener(
    "click",
    checkout
  );

}


/* =====================================================
   UPDATE OTOMATIS DARI ADMIN
===================================================== */

setInterval(
  function () {

    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );


    if (!saved) {
      return;
    }


    try {

      const parsed =
        JSON.parse(saved);


      if (
        !Array.isArray(parsed)
      ) {

        return;

      }


      const newBooks =
        parsed
          .map(normalizeBook)
          .filter(Boolean);


      const oldData =
        JSON.stringify(books);


      const newData =
        JSON.stringify(newBooks);


      if (
        oldData !==
        newData
      ) {

        books =
          newBooks;


        /*
          Buang item keranjang
          yang bukunya sudah tidak ada.
        */

        cart =
          cart.filter(
            item =>
              getBook(item.id)
          );


        saveCart();

        renderCategories();

        renderBooks();

        renderCart();

      }

    } catch (error) {

      console.error(
        "Gagal memperbarui buku:",
        error
      );

    }

  },
  2000
);


/* =====================================================
   START
===================================================== */

loadBooks();

loadCart();

renderCategories();

renderBooks();

renderCart();