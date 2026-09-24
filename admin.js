const STORAGE_KEY = "pesantrenBooks";
const MAX_PRICE = 100000000;


/* =========================================================
   DEFAULT BOOKS
========================================================= */

const defaultBooks = [
  {
    id: 1,
    title: "Al-Qur'an",
    author: "Al-Qur'an",
    productType: "print",
    price: 85000,
    stock: 10,
    printPrice: 85000,
    printStock: 10,
    digitalPrice: 0,
    digitalLink: "",
    category: "Al-Qur'an",
    description: "Al-Qur'an untuk kebutuhan membaca dan belajar.",
    cover: "📖"
  },
  {
    id: 2,
    title: "Tafsir Al-Qur'an",
    author: "Koleksi Tafsir",
    productType: "print",
    price: 120000,
    stock: 8,
    printPrice: 120000,
    printStock: 8,
    digitalPrice: 0,
    digitalLink: "",
    category: "Al-Qur'an",
    description: "Buku tafsir untuk membantu memahami kandungan Al-Qur'an.",
    cover: "📚"
  },
  {
    id: 3,
    title: "Kisah Para Nabi",
    author: "Tim Penulis",
    productType: "print",
    price: 80000,
    stock: 15,
    printPrice: 80000,
    printStock: 15,
    digitalPrice: 0,
    digitalLink: "",
    category: "Agama",
    description: "Kumpulan kisah para nabi.",
    cover: "🕌"
  },
  {
    id: 4,
    title: "Pendidikan Islam",
    author: "Tim Pendidikan",
    productType: "print",
    price: 90000,
    stock: 12,
    printPrice: 90000,
    printStock: 12,
    digitalPrice: 0,
    digitalLink: "",
    category: "Pendidikan",
    description: "Buku pendidikan Islam.",
    cover: "📘"
  },
  {
    id: 5,
    title: "Belajar Membaca Al-Qur'an",
    author: "Tim Pengajar",
    productType: "print",
    price: 65000,
    stock: 20,
    printPrice: 65000,
    printStock: 20,
    digitalPrice: 0,
    digitalLink: "",
    category: "Pendidikan",
    description: "Panduan belajar membaca Al-Qur'an.",
    cover: "📗"
  }
];


/* =========================================================
   STATE
========================================================= */

let books = loadBooks();
let editingId = null;
let currentImage = null;


/* =========================================================
   ELEMENTS
========================================================= */

const formSection =
  document.getElementById("bookFormSection");

const bookForm =
  document.getElementById("bookForm");

const formTitle =
  document.getElementById("formTitle");

const bookId =
  document.getElementById("bookId");

const bookTitle =
  document.getElementById("bookTitle");

const bookAuthor =
  document.getElementById("bookAuthor");

const productType =
  document.getElementById("productType");

const digitalFields =
  document.getElementById("digitalFields");

const printFields =
  document.getElementById("printFields");

const digitalPrice =
  document.getElementById("digitalPrice");

const digitalLink =
  document.getElementById("digitalLink");

const printPrice =
  document.getElementById("printPrice");

const printStock =
  document.getElementById("printStock");

const bookCategory =
  document.getElementById("bookCategory");

const bookDescription =
  document.getElementById("bookDescription");

const bookImage =
  document.getElementById("bookImage");

const coverPreview =
  document.getElementById("coverPreview");

const adminBookList =
  document.getElementById("adminBookList");

const adminSearch =
  document.getElementById("adminSearch");

const totalBooks =
  document.getElementById("totalBooks");

const totalStock =
  document.getElementById("totalStock");

const averagePrice =
  document.getElementById("averagePrice");

const notification =
  document.getElementById("notification");

const addNewBookButton =
  document.getElementById("addNewBookButton");

const cancelForm =
  document.getElementById("cancelForm");

const cancelFormBottom =
  document.getElementById("cancelFormBottom");


/* =========================================================
   LOAD BOOKS
========================================================= */

function loadBooks() {

  const saved =
    localStorage.getItem(STORAGE_KEY);

  if (!saved) {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(defaultBooks)
      );

    } catch (error) {

      console.warn(
        "Default books tidak dapat disimpan:",
        error
      );
    }

    return [...defaultBooks];
  }

  try {

    const parsed =
      JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [...defaultBooks];
    }

    return parsed;

  } catch (error) {

    console.error(
      "Gagal membaca data buku:",
      error
    );

    return [...defaultBooks];
  }
}


/* =========================================================
   SAVE BOOKS
========================================================= */

function saveBooks() {

  try {

    const data =
      JSON.stringify(books);

    localStorage.setItem(
      STORAGE_KEY,
      data
    );

    return true;

  } catch (error) {

    console.error(
      "Gagal menyimpan buku:",
      error
    );

    if (
      error &&
      (
        error.name === "QuotaExceededError" ||
        error.code === 22 ||
        error.code === 1014
      )
    ) {

      alert(
        "Penyimpanan browser penuh.\n\n" +
        "Cover gambar kemungkinan terlalu banyak atau terlalu besar.\n\n" +
        "Silakan hapus beberapa buku lama yang memakai cover gambar."
      );

    } else {

      alert(
        "Buku gagal disimpan.\n\n" +
        "Silakan coba lagi."
      );
    }

    return false;
  }
}


/* =========================================================
   NORMALIZE BOOK
========================================================= */

function normalizeBook(book) {

  const type =
    ["digital", "print", "both"].includes(
      book.productType
    )
      ? book.productType
      : (
          book.digitalLink ||
          Number(book.digitalPrice || 0) > 0
            ? "digital"
            : "print"
        );

  const oldPrice =
    Number(book.price || 0);

  const oldStock =
    Number(book.stock || 0);

  const normalized = {

    ...book,

    productType:
      type,

    digitalPrice:
      Number(
        book.digitalPrice ??
        (
          type === "digital"
            ? oldPrice
            : 0
        )
      ),

    digitalLink:
      book.digitalLink || "",

    printPrice:
      Number(
        book.printPrice ??
        (
          type !== "digital"
            ? oldPrice
            : 0
        )
      ),

    printStock:
      Number(
        book.printStock ??
        (
          type !== "digital"
            ? oldStock
            : 0
        )
      ),

    cover:
      book.cover || "📖"
  };

  if (type === "digital") {

    normalized.price =
      normalized.digitalPrice;

    normalized.stock =
      0;

  } else {

    normalized.price =
      normalized.printPrice;

    normalized.stock =
      normalized.printStock;
  }

  return normalized;
}


/* =========================================================
   NORMALIZE ALL BOOKS
========================================================= */

books =
  books.map(normalizeBook);


/* =========================================================
   PRICE FORMAT
========================================================= */

function formatPrice(price) {

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }
  ).format(
    Number(price) || 0
  );
}


/* =========================================================
   DISPLAY PRICE
========================================================= */

function getDisplayPrice(book) {

  const b =
    normalizeBook(book);

  if (b.productType === "digital") {

    return formatPrice(
      b.digitalPrice
    );
  }

  if (b.productType === "print") {

    return formatPrice(
      b.printPrice
    );
  }

  return (
    formatPrice(
      b.digitalPrice
    ) +
    " / " +
    formatPrice(
      b.printPrice
    )
  );
}


/* =========================================================
   DISPLAY STOCK
========================================================= */

function getDisplayStock(book) {

  const b =
    normalizeBook(book);

  if (b.productType === "digital") {
    return "Digital tersedia";
  }

  if (b.productType === "print") {

    return (
      "Stok cetak: " +
      b.printStock
    );
  }

  return (
    "Stok cetak: " +
    b.printStock +
    " · Digital tersedia"
  );
}


/* =========================================================
   NOTIFICATION
========================================================= */

function showNotification(message) {

  if (!notification) {
    return;
  }

  notification.textContent =
    message;

  notification.classList.add(
    "show"
  );

  setTimeout(
    function () {

      notification.classList.remove(
        "show"
      );

    },
    2500
  );
}


/* =========================================================
   UPDATE VARIANT FIELDS
========================================================= */

function updateVariantFields() {

  if (!productType) {
    return;
  }

  const type =
    productType.value;

  const digitalActive =
    type === "digital" ||
    type === "both";

  const printActive =
    type === "print" ||
    type === "both";


  if (digitalFields) {

    digitalFields.classList.toggle(
      "hidden",
      !digitalActive
    );
  }


  if (printFields) {

    printFields.classList.toggle(
      "hidden",
      !printActive
    );
  }


  if (digitalPrice) {

    digitalPrice.required =
      digitalActive;
  }


  if (digitalLink) {

    digitalLink.required =
      digitalActive;
  }


  if (printPrice) {

    printPrice.required =
      printActive;
  }


  if (printStock) {

    printStock.required =
      printActive;
  }
}


/* =========================================================
   STATISTICS
========================================================= */

function updateStats() {

  if (totalBooks) {

    totalBooks.textContent =
      books.length;
  }


  const stock =
    books.reduce(
      function (
        total,
        book
      ) {

        const normalized =
          normalizeBook(book);

        return (
          total +
          Number(
            normalized.printStock || 0
          )
        );

      },
      0
    );


  if (totalStock) {

    totalStock.textContent =
      stock;
  }


  if (books.length === 0) {

    if (averagePrice) {
      averagePrice.textContent =
        "Rp0";
    }

    return;
  }


  const totalPrice =
    books.reduce(
      function (
        total,
        book
      ) {

        const normalized =
          normalizeBook(book);

        let price = 0;


        if (
          normalized.productType ===
          "digital"
        ) {

          price =
            Number(
              normalized.digitalPrice || 0
            );

        } else if (
          normalized.productType ===
          "both"
        ) {

          price =
            (
              Number(
                normalized.digitalPrice || 0
              ) +
              Number(
                normalized.printPrice || 0
              )
            ) / 2;

        } else {

          price =
            Number(
              normalized.printPrice || 0
            );
        }


        return total + price;

      },
      0
    );


  if (averagePrice) {

    averagePrice.textContent =
      formatPrice(
        totalPrice /
        books.length
      );
  }
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

  return String(
    value ?? ""
  )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================================
   RENDER BOOKS
========================================================= */

function renderBooks() {

  if (!adminBookList) {
    return;
  }

  const search =
    adminSearch
      ? adminSearch.value
          .toLowerCase()
          .trim()
      : "";


  const filtered =
    books.filter(
      function (book) {

        return (

          String(
            book.title || ""
          )
            .toLowerCase()
            .includes(search)

          ||

          String(
            book.author || ""
          )
            .toLowerCase()
            .includes(search)

          ||

          String(
            book.category || ""
          )
            .toLowerCase()
            .includes(search)
        );
      }
    );


  if (
    filtered.length === 0
  ) {

    adminBookList.innerHTML = `

      <div class="empty">

        📚 Tidak ada buku ditemukan.

      </div>

    `;

    return;
  }


  adminBookList.innerHTML =
    filtered
      .map(
        function (rawBook) {

          const book =
            normalizeBook(
              rawBook
            );


          let cover;


          if (
            book.cover &&
            String(book.cover)
              .startsWith("data:")
          ) {

            cover = `
              <img
                src="${book.cover}"
                alt="${escapeHtml(book.title)}"
              >
            `;

          } else {

            cover =
              escapeHtml(
                book.cover ||
                "📖"
              );
          }


          let typeBadge;


          if (
            book.productType ===
            "digital"
          ) {

            typeBadge = `
              <span class="badge digital">
                💻 Digital
              </span>
            `;

          } else if (
            book.productType ===
            "print"
          ) {

            typeBadge = `
              <span class="badge print">
                📦 Cetak
              </span>
            `;

          } else {

            typeBadge = `
              <span class="badge">
                💻 + 📦 Digital + Cetak
              </span>
            `;
          }


          return `

            <div class="admin-book">

              <div class="admin-cover">

                ${cover}

              </div>


              <div class="admin-book-info">

                <h3>
                  ${escapeHtml(
                    book.title
                  )}
                </h3>

                <p>
                  ${escapeHtml(
                    book.author
                  )}
                  ·
                  ${escapeHtml(
                    book.category
                  )}
                </p>

                <div class="admin-book-meta">

                  ${typeBadge}

                </div>

              </div>


              <div>

                <div class="admin-book-price">

                  ${getDisplayPrice(book)}

                </div>

                <div class="admin-stock">

                  ${getDisplayStock(book)}

                </div>

              </div>


              <div class="admin-actions">

                <button
                  type="button"
                  class="edit-button"
                  data-edit="${book.id}"
                >
                  ✏️ Edit
                </button>

                <button
                  type="button"
                  class="delete-button"
                  data-delete="${book.id}"
                >
                  🗑️ Hapus
                </button>

              </div>

            </div>

          `;
        }
      )
      .join("");


  document
    .querySelectorAll("[data-edit]")
    .forEach(
      function (button) {

        button.addEventListener(
          "click",
          function () {

            editBook(
              Number(
                button.dataset.edit
              )
            );

          }
        );

      }
    );


  document
    .querySelectorAll("[data-delete]")
    .forEach(
      function (button) {

        button.addEventListener(
          "click",
          function () {

            deleteBook(
              Number(
                button.dataset.delete
              )
            );

          }
        );

      }
    );
}


/* =========================================================
   OPEN FORM
========================================================= */

function openForm() {

  if (!formSection) {
    return;
  }

  formSection.classList.remove(
    "hidden"
  );

  setTimeout(
    function () {

      formSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    },
    50
  );
}


/* =========================================================
   NEW BOOK
========================================================= */

function newBook(event) {

  if (event) {
    event.preventDefault();
  }

  editingId = null;
  currentImage = null;


  if (formTitle) {

    formTitle.textContent =
      "Tambah Buku";
  }


  if (bookForm) {
    bookForm.reset();
  }


  if (bookId) {
    bookId.value = "";
  }


  if (productType) {

    productType.value =
      "digital";
  }


  updateVariantFields();


  if (coverPreview) {

    coverPreview.innerHTML =
      "📖";
  }


  if (bookImage) {

    bookImage.value =
      "";
  }


  openForm();
}


/* =========================================================
   EDIT BOOK
========================================================= */

function editBook(id) {

  const rawBook =
    books.find(
      function (book) {

        return (
          Number(book.id) ===
          Number(id)
        );
      }
    );


  if (!rawBook) {
    return;
  }


  const book =
    normalizeBook(
      rawBook
    );


  editingId =
    Number(id);


  currentImage =
    book.cover ||
    null;


  if (formTitle) {

    formTitle.textContent =
      "Edit Buku";
  }


  if (bookId) {
    bookId.value =
      book.id;
  }


  bookTitle.value =
    book.title || "";

  bookAuthor.value =
    book.author || "";

  productType.value =
    book.productType ||
    "print";

  digitalPrice.value =
    book.digitalPrice || "";

  digitalLink.value =
    book.digitalLink || "";

  printPrice.value =
    book.printPrice || "";

  printStock.value =
    book.printStock ?? "";

  bookCategory.value =
    book.category || "";

  bookDescription.value =
    book.description || "";


  updateVariantFields();


  if (coverPreview) {

    if (
      book.cover &&
      String(book.cover)
        .startsWith("data:")
    ) {

      coverPreview.innerHTML = `

        <img
          src="${book.cover}"
          alt="Cover"
        >

      `;

    } else {

      coverPreview.innerHTML =
        escapeHtml(
          book.cover ||
          "📖"
        );
    }
  }


  if (bookImage) {

    bookImage.value =
      "";
  }


  openForm();
}


/* =========================================================
   DELETE BOOK
========================================================= */

function deleteBook(id) {

  const book =
    books.find(
      function (item) {

        return (
          Number(item.id) ===
          Number(id)
        );
      }
    );


  if (!book) {
    return;
  }


  const confirmed =
    confirm(
      `Hapus buku "${book.title}"?`
    );


  if (!confirmed) {
    return;
  }


  const oldBooks =
    [...books];


  books =
    books.filter(
      function (item) {

        return (
          Number(item.id) !==
          Number(id)
        );
      }
    );


  if (!saveBooks()) {

    books =
      oldBooks;

    return;
  }


  renderBooks();

  updateStats();


  showNotification(
    "Buku berhasil dihapus."
  );
}


/* =========================================================
   IMAGE COMPRESSION
========================================================= */

function compressCover(file) {

  return new Promise(
    function (
      resolve,
      reject
    ) {

      if (!file) {

        resolve(null);

        return;
      }


      if (
        !file.type ||
        !file.type.startsWith("image/")
      ) {

        reject(
          new Error(
            "File bukan gambar."
          )
        );

        return;
      }


      const reader =
        new FileReader();


      reader.onerror =
        function () {

          reject(
            new Error(
              "Gagal membaca gambar."
            )
          );

        };


      reader.onload =
        function (event) {

          const image =
            new Image();


          image.onerror =
            function () {

              reject(
                new Error(
                  "Gambar tidak dapat diproses."
                )
              );

            };


          image.onload =
            function () {

              try {

                const MAX_SIZE =
                  700;

                let width =
                  image.naturalWidth;

                let height =
                  image.naturalHeight;


                if (
                  !width ||
                  !height
                ) {

                  reject(
                    new Error(
                      "Ukuran gambar tidak valid."
                    )
                  );

                  return;
                }


                if (
                  width > MAX_SIZE ||
                  height > MAX_SIZE
                ) {

                  const ratio =
                    Math.min(
                      MAX_SIZE / width,
                      MAX_SIZE / height
                    );

                  width =
                    Math.round(
                      width * ratio
                    );

                  height =
                    Math.round(
                      height * ratio
                    );
                }


                const canvas =
                  document.createElement(
                    "canvas"
                  );


                canvas.width =
                  width;

                canvas.height =
                  height;


                const ctx =
                  canvas.getContext(
                    "2d"
                  );


                if (!ctx) {

                  reject(
                    new Error(
                      "Canvas tidak tersedia."
                    )
                  );

                  return;
                }


                ctx.fillStyle =
                  "#ffffff";

                ctx.fillRect(
                  0,
                  0,
                  width,
                  height
                );


                ctx.drawImage(
                  image,
                  0,
                  0,
                  width,
                  height
                );


                let result =
                  canvas.toDataURL(
                    "image/jpeg",
                    0.72
                  );


                /*
                   Kalau hasil masih besar,
                   kompres lagi.
                */

                if (
                  result.length >
                  250000
                ) {

                  result =
                    canvas.toDataURL(
                      "image/jpeg",
                      0.55
                    );
                }


                if (
                  !result ||
                  result.length < 50
                ) {

                  reject(
                    new Error(
                      "Gagal membuat cover."
                    )
                  );

                  return;
                }


                resolve(result);

              } catch (error) {

                reject(error);
              }
            };


          image.src =
            event.target.result;
        };


      reader.readAsDataURL(file);
    }
  );
}


/* =========================================================
   IMAGE UPLOAD
========================================================= */

if (bookImage) {

  bookImage.addEventListener(
    "change",
    async function () {

      const file =
        bookImage.files[0];


      if (!file) {
        return;
      }


      if (
        !file.type ||
        !file.type.startsWith("image/")
      ) {

        alert(
          "File yang dipilih harus berupa gambar."
        );

        bookImage.value =
          "";

        return;
      }


      if (
        file.size >
        15 * 1024 * 1024
      ) {

        alert(
          "Ukuran gambar terlalu besar.\n\n" +
          "Maksimal 15 MB."
        );

        bookImage.value =
          "";

        return;
      }


      if (coverPreview) {

        coverPreview.innerHTML = `

          <div
            style="
              color:white;
              font-size:13px;
              text-align:center;
              padding:15px;
            "
          >
            ⏳<br>
            Memproses cover...
          </div>

        `;
      }


      try {

        const compressed =
          await compressCover(
            file
          );


        if (!compressed) {

          throw new Error(
            "Cover kosong."
          );
        }


        currentImage =
          compressed;


        if (coverPreview) {

          coverPreview.innerHTML = `

            <img
              src="${compressed}"
              alt="Cover"
            >

          `;
        }


        showNotification(
          "Cover berhasil diproses."
        );

      } catch (error) {

        console.error(
          "Gagal memproses cover:",
          error
        );


        currentImage =
          editingId !== null
            ? (
                books.find(
                  function (book) {
                    return (
                      Number(book.id) ===
                      Number(editingId)
                    );
                  }
                )?.cover || null
              )
            : null;


        if (coverPreview) {

          if (
            currentImage &&
            String(currentImage)
              .startsWith("data:")
          ) {

            coverPreview.innerHTML = `

              <img
                src="${currentImage}"
                alt="Cover"
              >

            `;

          } else {

            coverPreview.innerHTML =
              escapeHtml(
                currentImage ||
                "📖"
              );
          }
        }


        bookImage.value =
          "";


        alert(
          "Cover gagal diproses.\n\n" +
          "Coba pilih gambar lain."
        );
      }
    }
  );
}


/* =========================================================
   FORM SUBMIT
========================================================= */

if (bookForm) {

  bookForm.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();


      const title =
        bookTitle.value.trim();

      const author =
        bookAuthor.value.trim();

      const type =
        productType.value;

      const category =
        bookCategory.value.trim();

      const description =
        bookDescription.value.trim();


      /* VALIDASI DASAR */

      if (!title) {

        alert(
          "Judul buku wajib diisi."
        );

        bookTitle.focus();

        return;
      }


      if (!author) {

        alert(
          "Nama penulis wajib diisi."
        );

        bookAuthor.focus();

        return;
      }


      if (!category) {

        alert(
          "Kategori wajib diisi."
        );

        bookCategory.focus();

        return;
      }


      if (
        !["digital", "print", "both"]
          .includes(type)
      ) {

        alert(
          "Jenis produk tidak valid."
        );

        return;
      }


      /* DIGITAL */

      let dPrice = 0;
      let dLink = "";


      if (
        type === "digital" ||
        type === "both"
      ) {

        dPrice =
          Math.floor(
            Number(
              digitalPrice.value
            )
          );


        dLink =
          digitalLink.value.trim();


        if (
          !Number.isFinite(dPrice) ||
          dPrice < 0
        ) {

          alert(
            "Harga digital tidak valid."
          );

          digitalPrice.focus();

          return;
        }


        if (
          dPrice >
          MAX_PRICE
        ) {

          alert(
            "Harga digital maksimal Rp100.000.000."
          );

          digitalPrice.focus();

          return;
        }


        if (!dLink) {

          alert(
            "Link/file digital wajib diisi."
          );

          digitalLink.focus();

          return;
        }
      }


      /* PRINT */

      let pPrice = 0;
      let pStock = 0;


      if (
        type === "print" ||
        type === "both"
      ) {

        pPrice =
          Math.floor(
            Number(
              printPrice.value
            )
          );


        pStock =
          Math.floor(
            Number(
              printStock.value
            )
          );


        if (
          !Number.isFinite(pPrice) ||
          pPrice < 0
        ) {

          alert(
            "Harga cetak tidak valid."
          );

          printPrice.focus();

          return;
        }


        if (
          pPrice >
          MAX_PRICE
        ) {

          alert(
            "Harga cetak maksimal Rp100.000.000."
          );

          printPrice.focus();

          return;
        }


        if (
          !Number.isFinite(pStock) ||
          pStock < 0
        ) {

          alert(
            "Stok cetak tidak valid."
          );

          printStock.focus();

          return;
        }
      }


      /* ID */

      const id =
        editingId !== null
          ? editingId
          : Date.now();


      /* COVER */

      let cover =
        currentImage ||
        "📖";


      /*
         Kalau edit dan tidak ada
         cover baru, pertahankan cover lama.
      */

      if (
        editingId !== null &&
        !currentImage
      ) {

        const oldBook =
          books.find(
            function (book) {

              return (
                Number(book.id) ===
                Number(editingId)
              );
            }
          );


        cover =
          oldBook?.cover ||
          "📖";
      }


      /* DATA BUKU */

      const newBook = {

        id,

        title,

        author,

        productType:
          type,

        digitalPrice:
          dPrice,

        digitalLink:
          dLink,

        printPrice:
          pPrice,

        printStock:
          pStock,

        price:
          type === "digital"
            ? dPrice
            : pPrice,

        stock:
          type === "digital"
            ? 0
            : pStock,

        category,

        description,

        cover
      };


      /* BACKUP */

      const oldBooks =
        [...books];


      /* EDIT */

      if (
        editingId !== null
      ) {

        const index =
          books.findIndex(
            function (book) {

              return (
                Number(book.id) ===
                Number(editingId)
              );
            }
          );


        if (index === -1) {

          alert(
            "Buku yang ingin diedit tidak ditemukan."
          );

          return;
        }


        books[index] =
          newBook;

      } else {

        books.unshift(
          newBook
        );
      }


      /*
         SIMPAN
      */

      if (!saveBooks()) {

        books =
          oldBooks;

        renderBooks();

        updateStats();

        return;
      }


      /*
         BERHASIL
      */

      renderBooks();

      updateStats();


      showNotification(
        editingId !== null
          ? "Buku berhasil diperbarui."
          : "Buku berhasil ditambahkan."
      );


      resetForm();

    }
  );
}


/* =========================================================
   RESET / CLOSE FORM
========================================================= */

function resetForm() {

  editingId =
    null;

  currentImage =
    null;


  if (bookForm) {
    bookForm.reset();
  }


  if (bookId) {
    bookId.value = "";
  }


  if (productType) {

    productType.value =
      "digital";
  }


  updateVariantFields();


  if (coverPreview) {

    coverPreview.innerHTML =
      "📖";
  }


  if (bookImage) {

    bookImage.value =
      "";
  }


  if (formSection) {

    formSection.classList.add(
      "hidden"
    );
  }
}


/* =========================================================
   BUTTON EVENTS
========================================================= */

/*
   INI YANG MEMPERBAIKI
   TOMBOL "+ TAMBAH BUKU"

   HTML kamu memakai:
   id="addNewBookButton"
*/

if (addNewBookButton) {

  addNewBookButton.addEventListener(
    "click",
    newBook
  );
}


if (cancelForm) {

  cancelForm.addEventListener(
    "click",
    function (event) {

      event.preventDefault();

      resetForm();

    }
  );
}


if (cancelFormBottom) {

  cancelFormBottom.addEventListener(
    "click",
    function (event) {

      event.preventDefault();

      resetForm();

    }
  );
}


/* =========================================================
   PRODUCT TYPE
========================================================= */

if (productType) {

  productType.addEventListener(
    "change",
    updateVariantFields
  );
}


/* =========================================================
   SEARCH
========================================================= */

if (adminSearch) {

  adminSearch.addEventListener(
    "input",
    renderBooks
  );
}


/* =========================================================
   STORAGE EVENT
========================================================= */

window.addEventListener(
  "storage",
  function (event) {

    if (
      event.key !== STORAGE_KEY
    ) {
      return;
    }


    books =
      loadBooks()
        .map(normalizeBook);


    renderBooks();

    updateStats();
  }
);


/* =========================================================
   START
========================================================= */

updateVariantFields();

renderBooks();

updateStats();