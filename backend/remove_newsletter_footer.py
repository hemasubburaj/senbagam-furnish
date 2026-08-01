import re

new_footer = '''<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <div class="brand" style="color:var(--linen);">Senbagam<span> Furniture</span></div>
        <p style="margin-top:16px;">Solid-wood furniture and home goods, designed in-house and shipped across India.</p>
      </div>
      <div>
        <h4>Shop</h4>
        <ul>
          <li><a href="products.html">All products</a></li>
          <li><a href="products.html?category=Combos">Combos</a></li>
          <li><a href="products.html?category=Bedroom">Bedroom</a></li>
          <li><a href="products.html?category=Living%20Room">Living Room</a></li>
          <li><a href="products.html?category=Pooja">Pooja</a></li>
        </ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="about.html">About us</a></li>
          <li><a href="testimonials.html">Testimonials</a></li>
          <li><a href="contact.html">Contact</a></li>
          <li><a href="track-order.html">Track order</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-note">
      <span>\u00a9 2026 Senbagam Furniture. Established 1997, Tirupur.</span>
      <span><a href="#">Privacy Policy</a> \u00b7 <a href="#">Terms of Service</a></span>
    </div>
  </div>
</footer>'''

files = [
    "index.html", "products.html", "product.html", "about.html",
    "contact.html", "cart.html", "checkout.html", "testimonials.html",
    "track-order.html"
]

footer_pattern = re.compile(r'<footer class="site-footer">.*?</footer>', re.DOTALL)

for fname in files:
    try:
        with open(fname) as f:
            content = f.read()
    except FileNotFoundError:
        print(f"{fname}: SKIPPED (file not found)")
        continue

    if not footer_pattern.search(content):
        print(f"{fname}: SKIPPED (no footer found)")
        continue

    new_content = footer_pattern.sub(lambda m: new_footer, content, count=1)
    with open(fname, 'w') as f:
        f.write(new_content)
    print(f"{fname}: updated (newsletter removed)")

print("Done.")
