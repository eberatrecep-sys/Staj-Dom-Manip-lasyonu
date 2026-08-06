const fs = require('fs');

const trPath = 'src/i18n/locales/tr.json';
const enPath = 'src/i18n/locales/en.json';

const trData = JSON.parse(fs.readFileSync(trPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const trAdditions = {
    home: "Anasayfa",
    edit_button: "Düzenle",
    save_button: "Kaydet",
    cancel_button: "İptal",
    logout: "Çıkış Yap",
    admin_panel: "Admin Paneli",
    super_admin_panel: "Super Admin Paneli",
    current_role: "Mevcut Rolünüz:",
    content_management: "İçerik Yönetimi (Title)",
    change_homepage_title: "Anasayfadaki ana başlığı (h1) değiştirin:",
    new_title: "Yeni Başlık...",
    update_btn: "Güncelle",
    currency_panel: "Döviz Paneli",
    test_currency_fluctuations: "Sistemdeki kur dalgalanmalarını test edin:",
    update_currency_data: "Döviz Verilerini Güncelle (403 Testi)",
    role_and_user_management: "Yetki ve Kullanıcı Yönetimi",
    make_content_admin: "Content Admin Yap",
    make_currency_admin: "Currency Admin Yap",
    make_user: "Normal User Yap",
    show: "Göster"
};

const enAdditions = {
    home: "Home",
    edit_button: "Edit",
    save_button: "Save",
    cancel_button: "Cancel",
    logout: "Logout",
    admin_panel: "Admin Panel",
    super_admin_panel: "Super Admin Panel",
    current_role: "Current Role:",
    content_management: "Content Management (Title)",
    change_homepage_title: "Change the main heading (h1) on the homepage:",
    new_title: "New Title...",
    update_btn: "Update",
    currency_panel: "Currency Panel",
    test_currency_fluctuations: "Test currency fluctuations in the system:",
    update_currency_data: "Update Currency Data (403 Test)",
    role_and_user_management: "Role & User Management",
    make_content_admin: "Make Content Admin",
    make_currency_admin: "Make Currency Admin",
    make_user: "Make Normal User",
    show: "Show"
};

Object.assign(trData.translation, trAdditions);
Object.assign(enData.translation, enAdditions);

fs.writeFileSync(trPath, JSON.stringify(trData, null, 4));
fs.writeFileSync(enPath, JSON.stringify(enData, null, 4));

console.log("i18n files updated!");
