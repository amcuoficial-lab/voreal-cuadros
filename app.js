// VOREAL CUADROS - Application Logic

// 1. App State
const state = {
    selectedSize: '', // chico, clasico, grande, triptico
    currentRoom: 'living', // living, bedroom, studio, clean
    uploadedImage: null,   // base64 image data url
    uploadedFilename: '', // original image filename
    cart: [],              // array of cart items
    rotated: false         // frame orientation: false=portrait, true=landscape
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
    triptychPreviewInfo: document.getElementById('triptych-preview-info'),
    visualizerPlaceholder: document.getElementById('visualizer-placeholder'),
    priceActionBox: document.getElementById('price-action-box'),
    
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
    loadCustomSiteContent();
    loadCartFromStorage();
    initEventListeners();
    updateUI();
    initGalleryCarousels();
    initWhatsAppChatWidget();
    initVisualEditor();
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
        if (e.target.value !== 'retiro') {
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

    // Direct WhatsApp Button for Triptychs
    elements.whatsappDirectBtn.addEventListener('click', () => {
        const size = state.selectedSize;
        const config = PRICING[size];
        const message = `¡Hola *Voreal Cuadros*! Me interesa encargar un cuadro en formato *${config.name}*.\n\n¿Podrían mostrarme los diseños/modelos disponibles para este tamaño y cómo enviar las fotos? 📲`;
        const encodedText = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;
        window.open(whatsappUrl, '_blank');
    });

    // Frame rotation button
    const rotateBtn = document.getElementById('rotate-frame-btn');
    if (rotateBtn) {
        rotateBtn.addEventListener('click', toggleFrameRotation);
    }
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
    
    if (!size) {
        if (elements.visualizerPlaceholder) elements.visualizerPlaceholder.classList.remove('hidden');
        if (elements.previewFrame) elements.previewFrame.classList.add('hidden');
        if (elements.previewTriptych) elements.previewTriptych.classList.add('hidden');
        if (elements.triptychPreviewInfo) elements.triptychPreviewInfo.classList.add('hidden');
        if (elements.stepUploadGroup) elements.stepUploadGroup.classList.add('hidden');
        if (elements.priceActionBox) elements.priceActionBox.classList.add('hidden');
        // Hide rotate controls when no size selected
        const rotCtrl = document.getElementById('rotate-controls');
        if (rotCtrl) rotCtrl.classList.add('hidden');
        return;
    }
    
    if (elements.visualizerPlaceholder) elements.visualizerPlaceholder.classList.add('hidden');
    if (elements.priceActionBox) elements.priceActionBox.classList.remove('hidden');
    
    const config = PRICING[size];
    
    elements.selectedSummarySize.textContent = config.name;
    elements.currentUnitPrice.textContent = formatPrice(config.unitPrice);
    
    // Reset frame classes
    elements.previewFrame.className = 'virtual-frame single-frame';
    
    if (size.startsWith('triptico_')) {
        elements.previewFrame.classList.add('hidden');
        elements.previewTriptych.classList.add('hidden');
        if (elements.triptychPreviewInfo) elements.triptychPreviewInfo.classList.remove('hidden');
        
        let label = '3 paneles';
        if (size === 'triptico_clasico') label = '3 paneles (3x 30x50 cm - total 1x50 cm)';
        if (size === 'triptico_grande') label = '3 paneles (3x 50x60 cm)';
        elements.scaleText.textContent = label;
        
        if (elements.triptychNotice) elements.triptychNotice.classList.remove('hidden');
        if (elements.stepUploadGroup) elements.stepUploadGroup.classList.add('hidden');
        if (elements.addToCartBtn) elements.addToCartBtn.classList.add('hidden');
        if (elements.whatsappDirectBtn) elements.whatsappDirectBtn.classList.remove('hidden');
        
        // Hide rotate for triptychs
        const rotCtrl = document.getElementById('rotate-controls');
        if (rotCtrl) rotCtrl.classList.add('hidden');
        state.rotated = false;
    } else {
        elements.previewTriptych.classList.add('hidden');
        if (elements.triptychPreviewInfo) elements.triptychPreviewInfo.classList.add('hidden');
        elements.previewFrame.classList.remove('hidden');
        elements.previewFrame.classList.add(`size-${size}`);
        
        // Apply rotation if active
        if (state.rotated) {
            elements.previewFrame.classList.add('rotated');
        }
        
        if (elements.triptychNotice) elements.triptychNotice.classList.add('hidden');
        if (elements.stepUploadGroup) elements.stepUploadGroup.classList.remove('hidden');
        if (elements.addToCartBtn) elements.addToCartBtn.classList.remove('hidden');
        if (elements.whatsappDirectBtn) elements.whatsappDirectBtn.classList.add('hidden');
        
        // Show rotate controls
        const rotCtrl = document.getElementById('rotate-controls');
        if (rotCtrl) rotCtrl.classList.remove('hidden');
        
        // Update scale text with orientation
        const orientation = state.rotated ? 'Horizontal' : 'Vertical';
        let dims = '';
        if (size === 'chico') dims = state.rotated ? '30x25 cm' : '25x30 cm';
        if (size === 'clasico') dims = state.rotated ? '50x30 cm' : '30x50 cm';
        if (size === 'grande') dims = state.rotated ? '60x50 cm' : '50x60 cm';
        elements.scaleText.textContent = `${dims} (• ${orientation})`;
        
        // Update orientation badge
        const badge = document.getElementById('orientation-badge');
        if (badge) badge.textContent = state.rotated ? '📵 Horizontal' : '📐 Vertical';
    }
}

// Rotate frame toggle
function toggleFrameRotation() {
    if (!state.selectedSize || state.selectedSize.startsWith('triptico_')) return;
    
    state.rotated = !state.rotated;
    
    const frame = elements.previewFrame;
    if (state.rotated) {
        frame.classList.add('rotated');
    } else {
        frame.classList.remove('rotated');
    }
    
    // Update size label and badge
    const size = state.selectedSize;
    let dims = '';
    if (size === 'chico') dims = state.rotated ? '30x25 cm' : '25x30 cm';
    if (size === 'clasico') dims = state.rotated ? '50x30 cm' : '30x50 cm';
    if (size === 'grande') dims = state.rotated ? '60x50 cm' : '50x60 cm';
    
    elements.scaleText.textContent = `${dims} (• ${state.rotated ? 'Horizontal' : 'Vertical'})`;
    
    const badge = document.getElementById('orientation-badge');
    if (badge) badge.textContent = state.rotated ? '📵 Horizontal' : '📐 Vertical';
    
    // Animate the rotate button icon
    const btn = document.getElementById('rotate-frame-btn');
    if (btn) {
        btn.style.transform = 'rotate(180deg)';
        setTimeout(() => { btn.style.transform = ''; }, 300);
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
    let deliveryLabel = '';
    if (deliveryMethod === 'moto') deliveryLabel = 'Envío por Moto (CABA/GBA)';
    else if (deliveryMethod === 'andreani') deliveryLabel = 'Andreani a Domicilio';
    else if (deliveryMethod === 'andreani_sucursal') deliveryLabel = 'Andreani a Sucursal';
    else if (deliveryMethod === 'retiro') deliveryLabel = 'Retiro por Punto Microcentro (CABA)';
    else if (deliveryMethod === 'retiro_olavarria') deliveryLabel = 'Retiro por Punto Olavarría (Bs. As.)';
    else deliveryLabel = deliveryMethod;

    message += `• *Entrega:* ${deliveryLabel}\n`;
    if (deliveryMethod !== 'retiro') {
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

// 12. Gallery Carousels logic
function initGalleryCarousels() {
    const items = document.querySelectorAll('.gallery-item');
    items.forEach(item => {
        const carousel = item.querySelector('.gallery-carousel');
        if (!carousel) return;

        const prevBtn = item.querySelector('.prev-btn');
        const nextBtn = item.querySelector('.next-btn');
        if (!prevBtn || !nextBtn) return;

        function showSlide(direction) {
            const currentSlides = carousel.querySelectorAll('.carousel-slide');
            if (currentSlides.length === 0) return;
            
            let activeIdx = Array.from(currentSlides).findIndex(s => s.classList.contains('active'));
            if (activeIdx === -1) {
                // If no slide is active, make the first one active
                currentSlides[0].classList.add('active');
                return;
            }
            
            currentSlides[activeIdx].classList.remove('active');
            
            const nextIdx = (activeIdx + direction + currentSlides.length) % currentSlides.length;
            currentSlides[nextIdx].classList.add('active');
        }

        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showSlide(-1);
        });

        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showSlide(1);
        });
        
        // Auto play every 5 seconds
        let interval = setInterval(() => {
            showSlide(1);
        }, 4000 + Math.random() * 2000); // offset intervals to look natural
        
        // Pause auto play on hover
        item.addEventListener('mouseenter', () => clearInterval(interval));
        item.addEventListener('mouseleave', () => {
            interval = setInterval(() => {
                showSlide(1);
            }, 5000);
        });
    });
}

// 13. WhatsApp AI Chat Bot Widget Logic
function initWhatsAppChatWidget() {
    const bubbleBtn = document.getElementById('wa-bubble-btn');
    const chatBox = document.getElementById('wa-chat-box');
    const closeBtn = document.getElementById('wa-close-btn');
    const chatInput = document.getElementById('wa-chat-input');
    const sendBtn = document.getElementById('wa-send-btn');
    const messagesContainer = document.getElementById('wa-chat-messages');
    const bubbleBadge = bubbleBtn ? bubbleBtn.querySelector('.wa-badge') : null;

    if (!bubbleBtn || !chatBox) return;

    // Toggle Chat Window
    bubbleBtn.addEventListener('click', () => {
        const isOpen = chatBox.classList.contains('open');
        if (!isOpen) {
            chatBox.classList.add('open');
            if (bubbleBadge) bubbleBadge.classList.add('hidden'); // Oculta la notificación al abrir
            setTimeout(() => {
                if (chatInput) chatInput.focus();
            }, 300);
        } else {
            chatBox.classList.remove('open');
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            chatBox.classList.remove('open');
        });
    }

    // Input submit with Enter key
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendUserMessage();
            }
        });
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            sendUserMessage();
        });
    }

    // Global function to call from quick options
    window.handleWaOption = function(option) {
        let userText = '';
        if (option === 'comprar') userText = '🎨 ¿Cómo comprar un cuadro?';
        else if (option === 'envios') userText = '🚚 Envíos y tiempos de fabricación';
        else if (option === 'precios') userText = '💰 Ver lista de precios';
        else if (option === 'agente') userText = '👤 Hablar con un Asesor Humano';

        appendMessage(userText, 'sent');
        removeQuickOptions();
        
        showTypingIndicator();

        setTimeout(() => {
            removeTypingIndicator();
            let botText = '';
            
            if (option === 'comprar') {
                botText = `¡Es súper fácil comprar tu cuadro Voreal! 👇\n\n1️⃣ Elegí la medida en la sección **1. Elige el tamaño**.\n2️⃣ Si elegiste un tamaño simple (Chico, Clásico o Grande), se abrirá la opción de **2. Sube tu imagen** para que cargues tu foto favorita. ¡Verás cómo queda colgada en tiempo real!\n3️⃣ Hacé clic en **Agregar al Carrito**, ingresá tus datos de envío y listo. Nos comunicamos por WhatsApp para finalizar.\n\n*Nota:* Para formatos **Trípticos**, hacé clic directo en *"Pedir Tríptico por WhatsApp"* y te enviamos un montaje digital del diseño con tu foto sin costo antes de que pagues. ✨`;
                appendMessage(botText, 'received');
                showQuickOptions();
            } else if (option === 'envios') {
                botText = `Nuestros métodos de envío y plazos son los siguientes: 👇\n\n• 🛠️ **Fabricación**: Demoramos exactamente **7 días** de corrido en producir tu cuadro desde que confirmamos las fotos.\n• 🛵 **Moto (CABA/GBA)**: Envío express directo a tu puerta.\n• 📦 **Andreani (A Domicilio)**: Enviamos a cualquier rincón de Argentina.\n• 🏪 **Andreani (A Sucursal)**: Retirás en la sucursal Andreani que prefieras.\n• 📍 **Retiro gratis — Microcentro (CABA)**: Coordinando día y horario.\n• 📍 **Retiro gratis — Olavarría (Bs. As.)**: También podés retirar en Olavarría sin cargo.`;
                appendMessage(botText, 'received');
                showQuickOptions();
            } else if (option === 'precios') {
                botText = `💰 **Lista de Precios Voreal (Actualizada):**\n\n• **Chicos (25x30 cm)**: $10.000 c/u\n   🔥 *¡PROMO:* **3x $25.000**\n• **Clásicos (30x50 cm)**: $15.000 c/u\n   🔥 *¡PROMO:* **3x $30.000**\n• **Grandes (50x60 cm)**: $25.000 c/u\n   🔥 *¡PROMO:* **2x $40.000**\n• **Tríptico Clásico** (3 paneles): $35.000 c/u\n   🔥 *¡PROMO:* **2x $60.000**\n• **Tríptico Grande** (3 paneles): $55.000 c/u\n   🔥 *¡PROMO:* **2x $100.000**\n\n*Los descuentos se aplican automáticamente en tu carrito web.*`;
                appendMessage(botText, 'received');
                showQuickOptions();
            } else if (option === 'agente') {
                botText = `Te estoy conectando con nuestro equipo humano en WhatsApp Business para brindarte asesoramiento personalizado... 📲\n\nSi no se abre automáticamente, hacé clic en el botón de abajo:\n\n👉 **[Hablar con un Agente en WhatsApp](https://wa.me/5491146739324?text=Hola,%20necesito%20asistencia%20de%20un%20agente%20humano)**`;
                appendMessage(botText, 'received');
                
                setTimeout(() => {
                    window.open('https://wa.me/5491146739324?text=Hola,%20necesito%20asistencia%20de%20un%20agente%20humano', '_blank');
                }, 1000);
            }
        }, 1200);
    };

    function sendUserMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        appendMessage(text, 'sent');
        chatInput.value = '';
        removeQuickOptions();

        showTypingIndicator();

        setTimeout(() => {
            removeTypingIndicator();
            const textLower = text.toLowerCase();
            let botText = '';

            if (textLower.includes('precio') || textLower.includes('cuanto sale') || textLower.includes('costo') || textLower.includes('precios') || textLower.includes('cuánto sale') || textLower.includes('cuanto cuestan') || textLower.includes('cuanto cuesta')) {
                botText = `💰 **Precios y Promociones Voreal:**\n\n• **Chicos (25x30 cm)**: $10.000\n   🔥 *PROMO:* **3x $25.000**\n• **Clásicos (30x50 cm)**: $15.000\n   🔥 *PROMO:* **3x $30.000**\n• **Grandes (50x60 cm)**: $25.000\n   🔥 *PROMO:* **2x $40.000**\n• **Tríptico Clásico**: $35.000\n   🔥 *PROMO:* **2x $60.000**\n• **Tríptico Grande**: $55.000\n   🔥 *PROMO:* **2x $100.000**`;
            } else if (textLower.includes('material') || textLower.includes('madera') || textLower.includes('calidad') || textLower.includes('como son') || textLower.includes('bastidor') || textLower.includes('bastidores') || textLower.includes('paneles')) {
                botText = `🎨 **Calidad de Galería Premium:**\nNuestros cuadros son de **alta definición montados en madera listos para colgar**. Son impresiones ultra-nítidas de colores vibrantes acopladas a bastidores de madera livianos. Vienen listos con colgadores o adhesivos premium para que los coloques sin necesidad de clavar la pared.`;
            } else if (textLower.includes('envio') || textLower.includes('envío') || textLower.includes('andreani') || textLower.includes('moto') || textLower.includes('sucursal') || textLower.includes('correo') || textLower.includes('despacho')) {
                botText = `🚚 **Métodos de Envío en Argentina:**\n\n• 🛵 **Moto Express**: Entregas rápidas en CABA y Gran Buenos Aires.\n• 📦 **Andreani a Domicilio**: A cualquier código postal del país.\n• 🏪 **Andreani a Sucursal**: Ideal para retirar cuando tengas tiempo.\n• 📍 **Retiro Microcentro (CABA)**: Retirarás gratis coordinando previamente.\n• 📍 **Retiro Olavarría (Bs. As.)**: También podés retirar sin cargo en Olavarría, Buenos Aires.`;
            } else if (textLower.includes('tiempo') || textLower.includes('tardan') || textLower.includes('demora') || textLower.includes('plazo') || textLower.includes('fabricacion') || textLower.includes('fabricación') || textLower.includes('cuanto demora') || textLower.includes('cuánto demora')) {
                botText = `⏱️ **Tiempos de Fabricación y Entrega:**\nLa producción demora exactamente **7 días** desde el momento en que confirmamos las fotos del pedido por WhatsApp. Posteriormente se realiza el despacho o retiro.`;
            } else if (textLower.includes('humano') || textLower.includes('agente') || textLower.includes('vendedor') || textLower.includes('asesor') || textLower.includes('whatsapp') || textLower.includes('wsap') || textLower.includes('contacto') || textLower.includes('hablar')) {
                botText = `Te estoy derivando con un asesor humano para asistirte personalmente en lo que necesites. 📲\n\nHacé clic en el siguiente botón:\n\n👉 **[Hablar con un Agente en WhatsApp](https://wa.me/5491146739324?text=Hola,%20necesito%20asistencia%20de%20un%20agente%20humano)**`;
                setTimeout(() => {
                    window.open('https://wa.me/5491146739324?text=Hola,%20necesito%20asistencia%20de%20un%20agente%20humano', '_blank');
                }, 1000);
            } else if (textLower.includes('chico') && textLower.includes('triptico') || textLower.includes('tríptico chico')) {
                botText = `⚠️ **Nota sobre Trípticos:**\nActualmente **no contamos con la opción de Tríptico Chico (3x 25x30 cm)**. Los tamaños de Trípticos disponibles son:\n• **Tríptico Clásico**: 3x 30x50 cm\n• **Tríptico Grande**: 3x 50x60 cm\nSi querés un diseño personalizado en otra medida, coordinémoslo con un Asesor Humano.`;
            } else {
                botText = `¡Gracias por tu mensaje! 🤖 Como asistente de Inteligencia Artificial de Voreal, te puedo informar sobre precios, materiales, métodos de envío o asistencia en personalización.\n\nSi preferís que te atienda un vendedor humano en WhatsApp Business, escribí la palabra **"agente"** o seleccioná la opción en el menú.`;
            }

            appendMessage(botText, 'received');
            showQuickOptions();
        }, 1200);
    }

    function appendMessage(text, type) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `wa-message ${type}`;
        
        // Simple markdown link conversion for bot replies
        let formattedText = text;
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        formattedText = formattedText.replace(linkRegex, '<a href="$2" target="_blank" style="color: #075E54; font-weight: bold; text-decoration: underline;">$1</a>');
        
        // Bold formatting
        formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        msgDiv.innerHTML = `<p>${formattedText}</p>`;
        messagesContainer.appendChild(msgDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showTypingIndicator() {
        const ind = document.createElement('div');
        ind.className = 'wa-typing-indicator';
        ind.id = 'wa-typing-indicator';
        ind.innerHTML = `Voreal está escribiendo
            <div class="wa-typing-dots">
                <div class="wa-typing-dot"></div>
                <div class="wa-typing-dot"></div>
                <div class="wa-typing-dot"></div>
            </div>`;
        messagesContainer.appendChild(ind);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function removeTypingIndicator() {
        const ind = document.getElementById('wa-typing-indicator');
        if (ind) ind.remove();
    }

    function removeQuickOptions() {
        const opts = document.getElementById('wa-quick-options');
        if (opts) opts.remove();
    }

    function showQuickOptions() {
        removeQuickOptions(); // ensure single instance
        
        const optsDiv = document.createElement('div');
        optsDiv.className = 'wa-quick-options';
        optsDiv.id = 'wa-quick-options';
        optsDiv.innerHTML = `
            <button class="wa-opt-btn" onclick="handleWaOption('comprar')">🎨 ¿Cómo comprar un cuadro?</button>
            <button class="wa-opt-btn" onclick="handleWaOption('envios')">🚚 Envíos y tiempos de fabricación</button>
            <button class="wa-opt-btn" onclick="handleWaOption('precios')">💰 Ver lista de precios</button>
            <button class="wa-opt-btn" onclick="handleWaOption('agente')">👤 Hablar con un Asesor Humano</button>
        `;
        messagesContainer.appendChild(optsDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// 14. Visual Content Editor logic
function loadCustomSiteContent() {
    try {
        const customHtml = localStorage.getItem('voreal_site_content_html');
        if (customHtml) {
            const root = document.getElementById('editable-content-root');
            if (root) {
                root.innerHTML = customHtml;
            }
        }
    } catch(e) {
        console.error("Error loading custom site content HTML", e);
    }
}


function initVisualEditor() {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('edit')) return;

    // Show Visual Editor Bar
    const editorBar = document.createElement('div');
    editorBar.className = 'editor-bar';
    editorBar.innerHTML = `
        <div class="editor-bar-content">
            <span class="editor-title">🖌️ MODO EDICIÓN VOREAL</span>
            <span class="editor-help">Haz clic en cualquier texto para modificarlo, o gestiona las fotos de los carruseles.</span>
            <div class="editor-actions">
                <button class="editor-btn btn-save" id="btn-editor-save">💾 Guardar Cambios</button>
                <button class="editor-btn btn-export" id="btn-editor-export">📥 Exportar index.html</button>
                <button class="editor-btn btn-cancel" id="btn-editor-cancel">❌ Salir</button>
            </div>
        </div>
    `;
    document.body.appendChild(editorBar);

    // Style elements in edit mode
    const styles = document.createElement('style');
    styles.innerHTML = `
        .editor-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: #1c1c1c;
            color: white;
            padding: 16px 24px;
            z-index: 100000;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
            font-family: 'Inter', sans-serif;
            box-sizing: border-box;
        }
        .editor-bar-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
        }
        .editor-title {
            font-weight: 700;
            letter-spacing: 1px;
            color: #C5A880;
        }
        .editor-help {
            font-size: 13px;
            opacity: 0.8;
        }
        .editor-actions {
            display: flex;
            gap: 12px;
        }
        .editor-btn {
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 12px;
            cursor: pointer;
            border: none;
            transition: all 0.2s ease;
        }
        .btn-save {
            background-color: #2ecc71;
            color: white;
        }
        .btn-save:hover { background-color: #27ae60; }
        .btn-export {
            background-color: #3498db;
            color: white;
        }
        .btn-export:hover { background-color: #2980b9; }
        .btn-cancel {
            background-color: #e74c3c;
            color: white;
        }
        .btn-cancel:hover { background-color: #c0392b; }
        
        /* Editable highlight */
        .v-editable-active {
            outline: 1px dashed #C5A880 !important;
            transition: outline 0.2s ease;
            cursor: pointer;
        }
        .v-editable-active:hover {
            outline: 2px solid #C5A880 !important;
            background-color: rgba(197, 168, 128, 0.05) !important;
        }

        /* Carousel Editing Elements */
        .v-carousel-edit-bar {
            position: absolute;
            bottom: 12px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 8px;
            z-index: 100;
            background: rgba(28, 28, 28, 0.85);
            backdrop-filter: blur(10px);
            padding: 6px 12px;
            border-radius: 30px;
            border: 1px solid rgba(197, 168, 128, 0.3);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        .v-carousel-btn-label {
            color: #ffffff;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-family: 'Inter', sans-serif;
            padding: 4px 8px;
            border-radius: 4px;
            transition: all 0.2s ease;
            margin: 0;
        }
        .v-carousel-btn-label:hover {
            color: #C5A880;
            background: rgba(255, 255, 255, 0.05);
        }
        .v-slide-delete-btn {
            position: absolute;
            top: 12px;
            right: 12px;
            z-index: 100;
            background: rgba(231, 76, 60, 0.9);
            color: white;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            transition: all 0.2s ease;
        }
        .v-slide-delete-btn:hover {
            background: #c0392b;
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(styles);

    // Make elements editable
    const root = document.getElementById('editable-content-root');
    if (root) {
        // Select all text-containing elements
        const editables = root.querySelectorAll('h1, h2, h3, h4, p, span, li, button, option, label');
        editables.forEach(el => {
            // Exclude drag drop zone elements, sample thumbnails, navigation, and visual editor UI elements
            if (
                el.closest('.drag-drop-zone') || 
                el.closest('.sample-images-container') || 
                el.classList.contains('carousel-nav-btn') ||
                el.closest('.v-carousel-edit-bar') ||
                el.classList.contains('v-slide-delete-btn')
            ) return;
            
            // Check if el has direct text content
            if (el.children.length === 0 || Array.from(el.childNodes).some(node => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== '')) {
                el.contentEditable = "true";
                el.classList.add('v-editable-active');
            }
        });

        // Initialize Carousel Editing Controls
        const wrappers = root.querySelectorAll('.gallery-img-wrapper');
        wrappers.forEach(wrapper => {
            // 1. Add Edit Bar
            const editBar = document.createElement('div');
            editBar.className = 'v-carousel-edit-bar';
            editBar.innerHTML = `
                <label class="v-carousel-btn-label">
                    ➕ Añadir Foto
                    <input type="file" accept="image/*" class="v-carousel-file-input" style="display:none;">
                </label>
            `;
            wrapper.appendChild(editBar);

            // File Upload Listener
            const fileInput = editBar.querySelector('.v-carousel-file-input');
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = function(evt) {
                    const base64Data = evt.target.result;
                    
                    // Show upload status
                    const btnLabel = editBar.querySelector('.v-carousel-btn-label');
                    const originalText = btnLabel.innerHTML;
                    btnLabel.innerHTML = '🔄 Subiendo...';

                    fetch('/api/upload-image', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            filename: file.name,
                            fileData: base64Data
                        })
                    })
                    .then(res => res.json())
                    .then(data => {
                        btnLabel.innerHTML = originalText;
                        if (data.success) {
                            const carousel = wrapper.querySelector('.gallery-carousel');
                            
                            // Deactivate existing slides
                            carousel.querySelectorAll('.carousel-slide').forEach(s => s.classList.remove('active'));

                            // Create new slide
                            const newSlide = document.createElement('div');
                            newSlide.className = 'carousel-slide active';
                            newSlide.style.backgroundImage = `url('${data.filePath}')`;
                            
                            // Add Delete Button
                            const delBtn = createDeleteBtn();
                            newSlide.appendChild(delBtn);

                            carousel.appendChild(newSlide);
                            alert('¡Foto subida y añadida al carrusel con éxito!');
                        } else {
                            alert('Error al subir imagen: ' + data.message);
                        }
                    })
                    .catch(err => {
                        btnLabel.innerHTML = originalText;
                        console.error(err);
                        alert('Error al conectar con el servidor para subir la imagen. Por favor, asegúrate de correr el servidor local ("node server.js").');
                    });
                };
                reader.readAsDataURL(file);
            });

            // 2. Add Delete Buttons to existing slides
            function createDeleteBtn() {
                const delBtn = document.createElement('button');
                delBtn.className = 'v-slide-delete-btn';
                delBtn.innerHTML = '🗑️';
                delBtn.title = 'Eliminar esta foto';
                delBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (confirm('¿Estás seguro de que quieres eliminar esta foto de la galería?')) {
                        const slide = delBtn.parentElement;
                        const carousel = slide.parentElement;
                        const wasActive = slide.classList.contains('active');
                        
                        slide.remove();
                        
                        // If active, make the first remaining slide active
                        if (wasActive) {
                            const remaining = carousel.querySelectorAll('.carousel-slide');
                            if (remaining.length > 0) {
                                remaining[0].classList.add('active');
                            }
                        }
                    }
                });
                return delBtn;
            }

            wrapper.querySelectorAll('.carousel-slide').forEach(slide => {
                const delBtn = createDeleteBtn();
                slide.appendChild(delBtn);
            });
        });
    }

    // Save Action
    document.getElementById('btn-editor-save').addEventListener('click', () => {
        // Show saving state on the button
        const saveBtn = document.getElementById('btn-editor-save');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '💾 Guardando...';
        saveBtn.disabled = true;

        // Clone DOM to construct clean HTML payload
        const rootClone = root.cloneNode(true);

        // Strip Visual Editor Elements
        rootClone.querySelectorAll('.v-carousel-edit-bar').forEach(el => el.remove());
        rootClone.querySelectorAll('.v-slide-delete-btn').forEach(el => el.remove());
        rootClone.querySelectorAll('[contenteditable]').forEach(el => {
            el.removeAttribute('contenteditable');
        });
        rootClone.querySelectorAll('.v-editable-active').forEach(el => {
            el.classList.remove('v-editable-active');
        });

        const customHtml = rootClone.innerHTML;

        // Try POSTing to local server
        fetch('/api/save-content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ html: customHtml })
        })
        .then(res => res.json())
        .then(data => {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
            
            if (data.success) {
                // Clear localStorage cache on successful disk save to keep disk as source of truth
                localStorage.removeItem('voreal_site_content_html');
                alert('🎉 ¡Cambios guardados de forma permanente en index.html!\nSincronizando con GitHub en segundo plano para actualizar la web de Vercel...');
            } else {
                // Backup save locally
                localStorage.setItem('voreal_site_content_html', customHtml);
                alert('⚠️ Guardado localmente en el navegador. El servidor reportó un problema: ' + data.message);
            }
        })
        .catch(err => {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
            console.warn('Saving to local server failed, falling back to localStorage.', err);

            // Backup save locally
            localStorage.setItem('voreal_site_content_html', customHtml);
            alert('💾 Cambios guardados localmente en tu navegador.\n\n(Nota: Si quieres que los cambios se guarden directamente en el archivo index.html físico y se suban a GitHub, recuerda ejecutar el servidor local con "node server.js").');
        });
    });

    // Cancel Action
    document.getElementById('btn-editor-cancel').addEventListener('click', () => {
        if (confirm('¿Salir del editor? Los cambios no guardados en disco o localmente se perderán.')) {
            window.location.href = window.location.pathname; // Reload without query params
        }
    });

    // Export Action
    document.getElementById('btn-editor-export').addEventListener('click', () => {
        // Clone document
        const docClone = document.documentElement.cloneNode(true);
        
        // Remove editor bar
        const cloneBar = docClone.querySelector('.editor-bar');
        if (cloneBar) cloneBar.remove();

        // Remove visualizer placeholder and restore preview frame visible state
        const clonePlaceholder = docClone.querySelector('#visualizer-placeholder');
        if (clonePlaceholder) clonePlaceholder.classList.add('hidden');
        
        const clonePreviewFrame = docClone.querySelector('#preview-frame');
        if (clonePreviewFrame) {
            clonePreviewFrame.classList.remove('hidden');
        }

        // Remove contenteditable, helpers, and edit interfaces
        docClone.querySelectorAll('[contenteditable]').forEach(el => {
            el.removeAttribute('contenteditable');
        });
        docClone.querySelectorAll('.v-editable-active').forEach(el => {
            el.classList.remove('v-editable-active');
        });
        docClone.querySelectorAll('.v-carousel-edit-bar').forEach(el => el.remove());
        docClone.querySelectorAll('.v-slide-delete-btn').forEach(el => el.remove());

        // Remove active class from sizes (default chico active)
        docClone.querySelectorAll('.size-card').forEach(card => {
            card.classList.remove('active');
        });
        const chicoCard = docClone.querySelector('.size-card[data-size="chico"]');
        if (chicoCard) chicoCard.classList.add('active');

        // Hide upload success in output index.html
        const cloneUploadSuccess = docClone.querySelector('#upload-success');
        if (cloneUploadSuccess) cloneUploadSuccess.classList.add('hidden');

        const cloneDropZone = docClone.querySelector('#drop-zone');
        if (cloneDropZone) cloneDropZone.classList.remove('hidden');

        // Hide price action box by default
        const clonePriceBox = docClone.querySelector('#price-action-box');
        if (clonePriceBox) clonePriceBox.classList.add('hidden');

        // Construct HTML file content
        const htmlContent = '<!DOCTYPE html>\n' + docClone.outerHTML;

        // Trigger file download
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('📥 Se ha descargado tu archivo "index.html" actualizado con los nuevos textos y carruseles. Reemplaza el archivo original en tu proyecto y súbelo a GitHub para actualizarlo de forma permanente en la web.');
    });
}
