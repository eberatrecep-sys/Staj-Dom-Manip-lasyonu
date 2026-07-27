# Web Geliştirme ve API Dünyasına Günlük Diliyle Bir Bakış 

*(Not: Bu raporu hazırlarken olabildiğince kitabi tanımlardan uzaklaşıp, "Biz bu işi gerçek hayatta nasıl kullanıyoruz?" mantığına odaklanmak istedim. Çünkü biliyorum ki döküman okurken insan bazen kayboluyor. Kendi staj/çalışma dönemimde bu kavramları ilk öğrendiğimdeki mantıkla notlar çıkardım.)*

---

## 1. API Nedir? Neden Sürekli "API Yazdım", "API Çöktü" Diyoruz?

En basit tabirle **API (Application Programming Interface)**, iki farklı uygulamanın birbiriyle konuşmasını sağlayan bir garson veya aracıdır. 

* **Kendi notum:** Düşün ki restorandasın (Frontend/Sen). Mutfağa (Backend/Veritabanı) gidip kendi yemeğini kendin yapmıyorsun. Garsona sipariş veriyorsun, o mutfağa iletiyor, mutfak yemeği hazırlayıp garsonla sana geri yolluyor. İşte o garson API'dir.

---

## 2. Browser "Network" Sekmesi: Olay Yeri İnceleme

Tarayıcıda F12'ye basıp "Network" (Ağ) sekmesini açtığınızda aslında arkaplanda dönen dedikoduları görürsünüz. İnternet sitesi her tıklandığında, her resim yüklendiğinde garsonu (API'yi) mutfağa koşturur. Network sekmesinde de şu yazar: *"Şu adrese gidildi, şu kadar saniyede şu veri getirildi veya hata alındı."*

---

## 3. Request Body ve Response Body (Sipariş Fişi ve Gelen Tabak)

* **Request Body (İstek Gövdesi):** Garsona sipariş verirken eline tutuşturduğumuz kağıttır. Örneğin; sisteme üye olurken "E-postam şu, şifrem şu" diye verdiğimiz paket, Request Body'dir.
* **Response Body (Cevap Gövdesi):** Mutfağın bize gönderdiği tepsi. İşlem başarılıysa tepside "Kullanıcı oluşturuldu" yazar. Veya aradığımız ürünlerin listesi gelir.

---

## 4. HTTP Metotları: Garsona Ne Yapmasını Söylüyoruz?

Mutfakla konuşurken sadece "Al bunu" veya "Ver şunu" demeyiz, spesifik komutlarımız vardır. 

* **GET:** *"Bana şu veriyi getir."* (Örnek: Anasayfadaki ürün listesini çekmek. Hiçbir şeyi değiştirmez, sadece okuruz.)
* **POST:** *"Al bu veriyi, mutfakta yeni bir şey yarat."* (Örnek: Yeni kayıt olmak, sepete ürün eklemek. Genelde içi dolu bir *Request Body* ile gönderilir.)
* **PUT:** *"Bunu al ve eskisinin yerine tamamen koy."* (Örnek: Profil güncellemesi. Eski profilin üstüne yenisini komple yazar.)
* **PATCH:** *"Sadece şu ufacık kısmı değiştir."* (Örnek: Sadece şifreyi değiştirmek. PUT'tan farkı, tüm profili değil sadece ilgili alanı güncellemesidir. *Pratikte bazen PATCH yerine de PUT kullanılır ama doğrusu budur.*)
* **DELETE:** *"Bunu yok et."* (Örnek: Hesabımı sil, market listesinden kolayı çıkar.)

---

## 5. JSON vs. XML: Dillerimiz

Garsonla mutfak arasındaki iletişimin bir dili olmalı. 

* **XML `<veri>`:** Eskilerin göz ağrısı. Tıpkı HTML gibi etiketler (tag'ler) kullanır. Okuması biraz yorucudur, çok yer kaplar. 
* **JSON `{veri}`:** JavaScript Object Notation. Yeni nesil standart. Parantezler `{ }` ve köşeli ayraçlar `[ ]` ile çalışır. Tıpkı bir sözlük gibidir. Hem insanların okuması çok kolaydır hem de bilgisayarın saniyesinde parçalaması.

* **Kendi notum:** Şu an piyasada %95 oranında JSON kullanılıyor diyebilirim. XML genelde banka veya devlet entegrasyonlarında (eski sistemler SOAP kullandığı için) karşımıza çıkıyor.

---

## 6. REST API vs. SOAP API (Modernlik vs. Kurallar)

* **SOAP:** Devlet dairesi gibidir. Çok katı kuralları vardır, bir virgülü eksik koysan işlemi reddeder. İletişimi sadece **XML** ile yapar. Çok güvenlidir ama geliştirmesi eziyettir.
* **REST (Representational State Transfer):** Modern, esnek, rahat çalışan mimaridir. İstediğin dili (genelde JSON) kullanabilirsin. HTTP metotlarını (GET, POST vs.) tam anlamıyla ve mantığıyla kullanır. Günümüzdeki mobil uygulamaların, web sitelerinin arka planı genelde REST mimarisiyle yazılır.

---

## 7. React mi Next.js mi? (Motor mu, Araba mı?)

Burası en çok kafa karıştıran yerlerden biri.

* **React:** Sadece bir kütüphanedir (library). Sana müthiş, dinamik bir arayüz yapma imkanı sunar ama gerisine (sayfa yönlendirmesi - routing, SEO, server tarafı işleri) karışmaz. "Ben sadece ekranı güzel çizerim, gerisi senin derdin" der. (Client-side çalışır.)
* **Next.js:** React'in üzerine kurulmuş tam teşekküllü bir **Framework'tür**. React'i alır, üstüne kendi paketlerini ekler. "Al sana yönlendirme sistemi (router), al sana SEO uyumluluğu, hatta al sana arka plan (backend/API) yazma yeri!" der. En büyük yeteneği sayfaları sunucuda oluşturup (SSR - Server Side Rendering) tarayıcıya öyle yollamasıdır. Bu sayede Google botları sayfayı çok hızlı okur.

* **Kendi notum:** Eğer Google'da üst sıralarda çıkması gerekmeyen, sadece giriş yapıp kullanılan bir yönetim paneli (Admin Panel) yazıyorsam **React (veya Vite + React)** kullanırım. Ama eğer e-ticaret sitesi, blog gibi SEO'nun hayati olduğu bir proje yazıyorsam hiç düşünmeden **Next.js** kullanırım.

---
*Umarım bu notlar, aklındaki kavramları daha somutlaştırmana yardımcı olur!* ☕️
