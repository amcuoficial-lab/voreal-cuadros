// VOREAL CUADROS - Application Logic

// 1. App State
const state = {
    selectedSize: 'chico', // chico, clasico, grande, triptico
    currentRoom: 'living', // living, bedroom, studio, clean
    uploadedImage: null,   // base64 image data url
    uploadedFilename: '', // original image filename
    cart: []              // array of cart items
};

// Pricing Configuration
const PRICING = {
    chico: {
        name: 'CHICOS (25x30 cm)',
        unitPrice: 10000,
        promoQty: 3,
        promoPrice: 25000,
        promoText: '3x $25.000'
    },
    clasico: {
        name: 'CLÁSICO (30x50 cm)',
        unitPrice: 15000,
        promoQty: 3,
        promoPrice: 30000,
        promoText: '3x $30.000'
    },
    grande: {
        name: 'GRANDE (50x60 cm)',
        unitPrice: 25000,
        promoQty: 2,
        promoPrice: 40000,
        promoText: '2x $40.000'
    },
    triptico_chico: {
        name: 'TRÍPTICO CHICO (3x 25x30 cm)',
        unitPrice: 25000,
        promoQty: 2,
        promoPrice: 45000,
        promoText: '2x $45.000'
    },
    triptico_clasico: {
        name: 'TRÍPTICO CLÁSICO (3x 30x50 cm - total 1x50 cm)',
        unitPrice: 35000,
        promoQty: 2,
        promoPrice: 60000,
        promoText: '2x $60.000'
    },
    triptico_grande: {
        name: 'TRÍPTICO GRANDE (3x 50x60 cm)',
        unitPrice: 55000,
        promoQty: 2,
        promoPrice: 100000,
        promoText: '2x $100.000'
    }
};

// WhatsApp Contact
const WHATSAPP_NUMBER = '5491146739324';

// 2. DOM Elements
const elements = {
    // Customizer Elements
    roomCanvas: document.getElementById('room-canvas'),
    previewFrame: document.getElementById('preview-frame'),
    frameContent: document.getElementById('frame-content'),
    previewTriptych: document.getElementById('preview-triptych'),
    panel1: document.getElementById('panel-1'),
    panel2: document.getElementById('panel-2'),
    panel3: document.getElementById('panel-3'),
    placeholderText: document.getElementById('placeholder-text'),
    scaleText: document.getElementById('scale-text'),
    triptychNotice: document.getElementById('triptych-notice'),
    
    // Controls Elements
    imageUpload: document.getElementById('image-upload'),
    dropZone: document.getElementById('drop-zone'),
    stepUploadGroup: document.getElementById('step-upload-group'),
    uploadSuccess: document.getElementById('upload-success'),
    uploadedFilenameSpan: document.getElementById('uploaded-filename'),
    removeImgBtn: document.getElementById('remove-img-btn'),
    sizeCards: document.querySelectorAll('.size-card'),
    roomTabs: document.querySelectorAll('.room-tab'),
    sampleThumbs: document.querySelectorAll('.sample-thumb'),
    
    // Summary & Cart Trigger Elements
    selectedSummarySize: document.getElementById('selected-summary-size'),
    currentUnitPrice: document.getElementById('current-unit-price'),
    addToCartBtn: document.getElementById('add-to-cart-btn'),
    whatsappDirectBtn: document.getElementById('whatsapp-direct-btn'),
    openCartBtn: document.getElementById('open-cart-btn'),
    closeCartBtn: document.getElementById('close-cart-btn'),
    cartCount: document.getElementById('cart-count'),
    
    // Cart Drawer Elements
    cartDrawer: document.getElementById('cart-drawer'),
    cartOverlay: document.getElementById('cart-overlay'),
    emptyCartMsg: document.getElementById('empty-cart-msg'),
    cartItemsContainer: document.getElementById('cart-items-container'),
    cartSummary: document.getElementById('cart-summary'),
    cartPromoBadge: document.getElementById('cart-promo-badge'),
    cartSubtotalOriginal: document.getElementById('cart-subtotal-original'),
    cartTotal: document.getElementById('cart-total'),
    closeDrawerLinks: document.querySelectorAll('.close-drawer-link'),
    
    // Checkout Form Elements
    checkoutForm: document.getElementById('checkout-form'),
    clientName: document.getElementById('client-name'),
    clientPhone: document.getElementById('client-phone'),
    clientDelivery: document.getElementById('client-delivery'),
    addressGroup: document.getElementById('address-group'),
    clientAddress: document.getElementById('client-address'),
    clientNotes: document.getElementById('client-notes')
};

// 3. Initializer
document.addEventListener('DOMContentLoaded', () => {
    loadCartFromStorage();
    initEventListeners();
    updateUI();
});

// 4. Event Listeners Setup
function initEventListeners() {

    // Image Upload Events (File Input)
    elements.imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleImageFile(file);
    });

    // Drag and Drop Events
    elements.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.dropZone.classList.add('dragover');
    });

    elements.dropZone.addEventListener('dragleave', () => {
        elements.dropZone.classList.remove('dragover');
    });

    elements.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageFile(file);
        }
    });

    // Sample Images Clicking
    elements.sampleThumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            elements.sampleThumbs.forEach(t => t.classList.remove('active-thumb'));
            thumb.classList.add('active-thumb');
            
            const imageUrl = thumb.dataset.url;
            state.uploadedImage = imageUrl;
            state.uploadedFilename = thumb.alt || 'Imagen de muestra';
            
            applyImageToFrames(imageUrl);
            
            // Show success styling
            elements.dropZone.classList.add('hidden');
            elements.uploadSuccess.classList.remove('hidden');
            elements.uploadedFilenameSpan.textContent = state.uploadedFilename;

            // Restablecer el botón de agregar al carrito por si estaba procesando
            elements.addToCartBtn.disabled = false;
            elements.addToCartBtn.textContent = 'Agregar al Carrito';
        });
    });

    // Remove Image Button
    elements.removeImgBtn.addEventListener('click', () => {
        state.uploadedImage = null;
        state.uploadedFilename = '';
        elements.imageUpload.value = '';
        
        // Restablecer el botón de agregar al carrito
        elements.addToCartBtn.disabled = false;
        elements.addToCartBtn.textContent = 'Agregar al Carrito';
        
        // Remove sample image active border
        elements.sampleThumbs.forEach(t => t.classList.remove('active-thumb'));
        
        // Reset preview
        elements.frameContent.style.backgroundImage = 'none';
        elements.panel1.style.backgroundImage = 'none';
        elements.panel2.style.backgroundImage = 'none';
        elements.panel3.style.backgroundImage = 'none';
        elements.placeholderText.classList.remove('hidden');
        
        elements.uploadSuccess.classList.add('hidden');
        elements.dropZone.classList.remove('hidden');
    });

    // Size Card Selector
    elements.sizeCards.forEach(card => {
        card.addEventListener('click', () => {
            elements.sizeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            const size = card.dataset.size;
            state.selectedSize = size;
            updateCustomizerDimensions();
        });
    });

    // Cart Drawer Toggle
    elements.openCartBtn.addEventListener('click', openCart);
    elements.closeCartBtn.addEventListener('click', closeCart);
    elements.cartOverlay.addEventListener('click', closeCart);
    
    // Close Drawer Links (inside empty cart msg)
    elements.closeDrawerLinks.forEach(link => {
        link.addEventListener('click', closeCart);
    });

    // Add to Cart
    elements.addToCartBtn.addEventListener('click', addToCart);

    // Delivery Method Toggle Address Field
    elements.clientDelivery.addEventListener('change', (e) => {
        if (e.target.value === 'envio') {
            elements.addressGroup.classList.remove('hidden');
            elements.clientAddress.setAttribute('required', 'required');
        } else {
            elements.addressGroup.classList.add('hidden');
            elements.clientAddress.removeAttribute('required');
        }
    });

    // FAQ Accordion
    const faqTriggers = document.querySelectorAll('.faq-trigger');
    faqTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const item = trigger.parentNode;
            const wasActive = item.classList.contains('active');
            
            // Close all items
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            
            if (!wasActive) {
                item.classList.add('active');
            }
        });
    });

    // Checkout Form Submission
    elements.checkoutForm.addEventListener('submit', handleCheckout);

    // Direct WhatsApp Button for Triptychs (Triptychs are processed directly via WhatsApp)
    elements.whatsappDirectBtn.addEventListener('click', () => {
        const size = state.selectedSize;
        const config = PRICING[size];
        const message = `¡Hola *Voreal Cuadros*! Me interesa encargar un cuadro en formato *${config.name}*.\n\n¿Podrían mostrarme los diseños/modelos disponibles para este tamaño y cómo enviar las fotos? 📲`;
        const encodedText = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;
        window.open(whatsappUrl, '_blank');
    });
}

// 5. Image Handler
function handleImageFile(file) {
    // Deshabilitar botón mientras procesa
    elements.addToCartBtn.disabled = true;
    elements.addToCartBtn.textContent = 'Procesando imagen...';
    
    // Previsualización visual inmediata en alta calidad usando Object URL (más eficiente en memoria)
    const objectUrl = URL.createObjectURL(file);
    applyImageToFrames(objectUrl);
    
    // Remover borde de imágenes de muestra
    elements.sampleThumbs.forEach(t => t.classList.remove('active-thumb'));
    
    compressImage(file, (compressedDataUrl) => {
        state.uploadedImage = compressedDataUrl;
        state.uploadedFilename = file.name;
        
        elements.dropZone.classList.add('hidden');
        elements.uploadSuccess.classList.remove('hidden');
        elements.uploadedFilenameSpan.textContent = file.name;
        
        // Habilitar botón de agregar al carrito
        elements.addToCartBtn.disabled = false;
        elements.addToCartBtn.textContent = 'Agregar al Carrito';
    });
}

// Helper to compress images for storage efficiency (avoiding QuotaExceededError in localStorage)
function compressImage(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 500;
            const MAX_HEIGHT = 500;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to JPEG format with 0.7 quality to reduce size to ~30-50KB
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            callback(compressedDataUrl);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Helper to set background images of virtual frames
function applyImageToFrames(src) {
    elements.placeholderText.classList.add('hidden');
    
    // Single Frame
    elements.frameContent.style.backgroundImage = `url('${src}')`;
    
    // Triptych Panels
    elements.panel1.style.backgroundImage = `url('${src}')`;
    elements.panel2.style.backgroundImage = `url('${src}')`;
    elements.panel3.style.backgroundImage = `url('${src}')`;
}

// 6. Update Customizer Dimensions & Scaling Visuals
function updateCustomizerDimensions() {
    const size = state.selectedSize;
    const config = PRICING[size];
    
    // Update labels
    elements.selectedSummarySize.textContent = config.name;
    elements.currentUnitPrice.textContent = formatPrice(config.unitPrice);
    
    // Reset sizes classes
    elements.previewFrame.className = 'virtual-frame single-frame';
    
    if (size.startsWith('triptico_')) {
        elements.previewFrame.classList.add('hidden');
        elements.previewTriptych.classList.remove('hidden');
        
        // Apply the correct size class for the triptych container
        elements.previewTriptych.className = 'triptych-frame-container ' + size;
        
        let label = '3 paneles';
        if (size === 'triptico_chico') label = '3 paneles (3x 25x30 cm)';
        if (size === 'triptico_clasico') label = '3 paneles (3x 30x50 cm - total 1x50 cm)';
        if (size === 'triptico_grande') label = '3 paneles (3x 50x60 cm)';
        elements.scaleText.textContent = label;
        
        if (elements.triptychNotice) elements.triptychNotice.classList.remove('hidden');
        if (elements.stepUploadGroup) elements.stepUploadGroup.classList.add('hidden');
        if (elements.addToCartBtn) elements.addToCartBtn.classList.add('hidden');
        if (elements.whatsappDirectBtn) elements.whatsappDirectBtn.classList.remove('hidden');
    } else {
        elements.previewTriptych.classList.add('hidden');
        elements.previewFrame.classList.remove('hidden');
        elements.previewFrame.classList.add(`size-${size}`);
        if (elements.triptychNotice) elements.triptychNotice.classList.add('hidden');
        if (elements.stepUploadGroup) elements.stepUploadGroup.classList.remove('hidden');
        if (elements.addToCartBtn) elements.addToCartBtn.classList.remove('hidden');
        if (elements.whatsappDirectBtn) elements.whatsappDirectBtn.classList.add('hidden');
        
        let label = '';
        if (size === 'chico') label = '25x30 cm (Chico)';
        if (size === 'clasico') label = '30x50 cm (Clásico)';
        if (size === 'grande') label = '50x60 cm (Grande)';
        elements.scaleText.textContent = label;
    }
}

// 7. Cart Operations
function addToCart() {
    const size = state.selectedSize;
    const config = PRICING[size];
    
    // For single formats, check if photo is uploaded.
    // For triptychs, we allow checkout without photo upload (it coordinates via WhatsApp).
    if (!state.uploadedImage && !size.startsWith('triptico_')) {
        alert('🎨 Por favor, sube tu foto o selecciona una imagen de muestra antes de agregar al carrito.');
        
        // Scroll smoothly to drop zone
        elements.dropZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    const itemImageSrc = state.uploadedImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600';
    const itemImageName = state.uploadedFilename || 'A definir por WhatsApp';

    // Check if duplicate item exists
    const existingIndex = state.cart.findIndex(item => item.size === size && item.imageSrc === itemImageSrc);
    
    if (existingIndex > -1) {
        state.cart[existingIndex].quantity += 1;
    } else {
        state.cart.push({
            id: Date.now().toString(),
            size: size,
            sizeName: config.name,
            unitPrice: config.unitPrice,
            imageSrc: itemImageSrc,
            imageName: itemImageName,
            quantity: 1
        });
    }
    
    saveCartToStorage();
    renderCart();
    openCart();
    
    // Subtle animation for badge
    elements.cartCount.style.transform = 'scale(1.2)';
    setTimeout(() => {
        elements.cartCount.style.transform = 'scale(1)';
    }, 200);
}

function updateQty(itemId, delta) {
    const item = state.cart.find(i => i.id === itemId);
    if (!item) return;
    
    item.quantity += delta;
    if (item.quantity <= 0) {
        deleteItem(itemId);
    } else {
        saveCartToStorage();
        renderCart();
    }
}

function deleteItem(itemId) {
    state.cart = state.cart.filter(item => item.id !== itemId);
    saveCartToStorage();
    renderCart();
}

function openCart() {
    elements.cartDrawer.classList.add('open');
    elements.cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden'; // prevent background scrolling
}

function closeCart() {
    elements.cartDrawer.classList.remove('open');
    elements.cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

// 8. Promo Price Calculation
function calculateCartTotals() {
    let subtotalOriginal = 0;
    let finalTotal = 0;
    let promoApplied = false;
    
    // Group quantities by size for promotion calculations
    const sizeQuantities = {
        chico: 0,
        clasico: 0,
        grande: 0,
        triptico: 0
    };
    
    state.cart.forEach(item => {
        sizeQuantities[item.size] += item.quantity;
        subtotalOriginal += item.unitPrice * item.quantity;
    });
    
    // Apply promo formula per size
    Object.keys(sizeQuantities).forEach(size => {
        const qty = sizeQuantities[size];
        if (qty === 0) return;
        
        const config = PRICING[size];
        
        // promo packages
        const packages = Math.floor(qty / config.promoQty);
        const remainder = qty % config.promoQty;
        
        const promoCost = (packages * config.promoPrice) + (remainder * config.unitPrice);
        finalTotal += promoCost;
        
        if (packages > 0) {
            promoApplied = true;
        }
    });
    
    return {
        original: subtotalOriginal,
        final: finalTotal,
        promoApplied: promoApplied
    };
}

// 9. Render Cart
function renderCart() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    elements.cartCount.textContent = totalItems;
    
    if (state.cart.length === 0) {
        elements.emptyCartMsg.classList.remove('hidden');
        elements.cartItemsContainer.classList.add('hidden');
        elements.cartSummary.classList.add('hidden');
        return;
    }
    
    elements.emptyCartMsg.classList.add('hidden');
    elements.cartItemsContainer.classList.remove('hidden');
    elements.cartSummary.classList.remove('hidden');
    
    // Build items HTML
    elements.cartItemsContainer.innerHTML = '';
    
    state.cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        
        // Preview render (checks if triptych for special split preview)
        let previewHTML = '';
        if (item.size === 'triptico') {
            previewHTML = `
                <div class="cart-item-preview triptych-item">
                    <div class="sub-panel" style="background-image: url('${item.imageSrc}'); background-position: 0% center;"></div>
                    <div class="sub-panel" style="background-image: url('${item.imageSrc}'); background-position: 50% center;"></div>
                    <div class="sub-panel" style="background-image: url('${item.imageSrc}'); background-position: 100% center;"></div>
                </div>
            `;
        } else {
            previewHTML = `<div class="cart-item-preview" style="background-image: url('${item.imageSrc}');"></div>`;
        }
        
        itemDiv.innerHTML = `
            ${previewHTML}
            <div class="cart-item-details">
                <h4 class="cart-item-name">${PRICING[item.size].name}</h4>
                <p class="cart-item-meta">Foto: ${truncateString(item.imageName, 22)}</p>
                <div class="cart-item-bottom">
                    <div class="qty-controls">
                        <button type="button" class="qty-btn dec-btn" onclick="updateQty('${item.id}', -1)">&minus;</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button type="button" class="qty-btn inc-btn" onclick="updateQty('${item.id}', 1)">&plus;</button>
                    </div>
                    <span class="cart-item-price">${formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
            </div>
            <button class="delete-item-btn" onclick="deleteItem('${item.id}')" aria-label="Eliminar item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        `;
        elements.cartItemsContainer.appendChild(itemDiv);
    });
    
    // Totals & Promos display
    const totals = calculateCartTotals();
    
    elements.cartSubtotalOriginal.textContent = formatPrice(totals.original);
    elements.cartTotal.textContent = formatPrice(totals.final);
    
    if (totals.promoApplied) {
        elements.cartPromoBadge.classList.remove('hidden');
        elements.cartSubtotalOriginal.parentNode.classList.remove('hidden');
    } else {
        elements.cartPromoBadge.classList.add('hidden');
        elements.cartSubtotalOriginal.parentNode.classList.add('hidden');
    }
}

// 10. Checkout WhatsApp Compilation
function handleCheckout(e) {
    e.preventDefault();
    
    if (state.cart.length === 0) return;
    
    const name = elements.clientName.value.trim();
    const phone = elements.clientPhone.value.trim();
    const deliveryMethod = elements.clientDelivery.value;
    const address = elements.clientAddress.value.trim();
    const notes = elements.clientNotes.value.trim();
    
    const totals = calculateCartTotals();
    
    // Formulate Order Details
    let orderDetailText = '';
    state.cart.forEach((item, index) => {
        const itemSize = PRICING[item.size].name;
        orderDetailText += `📦 *Cuadro ${index + 1}:*\n`;
        orderDetailText += `   - Formato: ${itemSize}\n`;
        orderDetailText += `   - Cantidad: ${item.quantity}\n`;
        if (item.size === 'triptico') {
            orderDetailText += `   - Foto: A definir / Mostrar por WhatsApp 📲\n`;
            orderDetailText += `   - Estado Foto: (Coordinar modelo y fotos con el vendedor)\n`;
        } else {
            orderDetailText += `   - Foto: ${item.imageName}\n`;
            if (item.imageSrc.startsWith('data:')) {
                orderDetailText += `   - Estado Foto: (Cargada vía Web - Listo para procesar)\n`;
            } else {
                orderDetailText += `   - Estado Foto: (Muestra de catálogo: ${item.imageName})\n`;
            }
        }
        orderDetailText += `\n`;
    });
    
    // 1. Save order to CRM Database (localStorage)
    const orderId = 'VR-' + Math.floor(1000 + Math.random() * 9000);
    const orderDate = new Date().toLocaleDateString('es-AR') + ' ' + new Date().toLocaleTimeString('es-AR', {hour: '2-digit', minute:'2-digit'});
    
    const newOrder = {
        id: orderId,
        client: {
            name: name,
            phone: phone,
            delivery: deliveryMethod,
            address: address,
            notes: notes
        },
        items: state.cart.map(item => ({
            size: item.size,
            sizeName: PRICING[item.size].name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            imageName: item.imageName,
            imageSrc: item.imageSrc
        })),
        originalTotal: totals.original,
        finalTotal: totals.final,
        promoApplied: totals.promoApplied,
        date: orderDate,
        status: 'Pendiente'
    };
    
    try {
        const existingOrders = JSON.parse(localStorage.getItem('voreal_orders') || '[]');
        existingOrders.unshift(newOrder);
        localStorage.setItem('voreal_orders', JSON.stringify(existingOrders));
    } catch(err) {
        console.error("Error al guardar pedido en CRM", err);
    }
    
    // 2. Build WhatsApp message
    let message = `¡Hola *Voreal Cuadros*! Deseo encargar los siguientes cuadros personalizados (Orden: *${orderId}*):\n\n`;
    message += `👤 *Datos del Cliente:*\n`;
    message += `• *Nombre:* ${name}\n`;
    message += `• *WhatsApp:* ${phone}\n`;
    message += `• *Entrega:* ${deliveryMethod === 'envio' ? 'Envío a Domicilio/Correo' : 'Retiro por Punto de Entrega'}\n`;
    if (deliveryMethod === 'envio') {
        message += `• *Dirección:* ${address}\n`;
    }
    message += `\n🛒 *Resumen del Pedido:*\n${orderDetailText}`;
    
    if (totals.promoApplied) {
        message += `🔥 *Promoción Aplicada:* ¡Sí! (Descuentos especiales por cantidad incluidos)\n`;
        message += `• *Precio de lista:* ${formatPrice(totals.original)}\n`;
    }
    
    message += `💰 *TOTAL A ABONAR:* *${formatPrice(totals.final)}*\n\n`;
    
    if (notes) {
        message += `💬 *Notas adicionales:* ${notes}\n\n`;
    }
    
    message += `--------------------------------------\n`;
    message += `✉️ _Te adjunto a continuación las imágenes en alta resolución en este chat para iniciar la producción._`;
    
    // Encode for URL
    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;
    
    // 3. Clear cart and reset UI
    state.cart = [];
    saveCartToStorage();
    renderCart();
    closeCart();
    
    // Reset checkout form fields
    elements.checkoutForm.reset();
    elements.addressGroup.classList.add('hidden');
    
    // 4. Redirect user to WhatsApp
    window.open(whatsappUrl, '_blank');
}

// 11. Helper Functions
function formatPrice(val) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(val);
}

function truncateString(str, num) {
    if (!str) return '';
    if (str.length <= num) {
        return str;
    }
    return str.slice(0, num) + '...';
}

function updateUI() {
    updateCustomizerDimensions();
    renderCart();
}

// Local Storage integration (using consistent voreal_cart name)
function saveCartToStorage() {
    try {
        localStorage.setItem('voreal_cart', JSON.stringify(state.cart));
    } catch(e) {
        console.error("No se pudo guardar el carrito en localstorage", e);
    }
}

function loadCartFromStorage() {
    try {
        const stored = localStorage.getItem('voreal_cart');
        if (stored) {
            state.cart = JSON.parse(stored);
        }
    } catch(e) {
        console.error("No se pudo leer el carrito de localstorage", e);
    }
}
