import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container-fk">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-gray-700">
          {/* About */}
          <div>
            <h4 className="footer-heading">About</h4>
            <ul className="space-y-2">
              <li><Link href="/">Contact Us</Link></li>
              <li><Link href="/">About Us</Link></li>
              <li><Link href="/">Careers</Link></li>
              <li><Link href="/">Flipkart Stories</Link></li>
              <li><Link href="/">Press</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="footer-heading">Help</h4>
            <ul className="space-y-2">
              <li><Link href="/">Payments</Link></li>
              <li><Link href="/">Shipping</Link></li>
              <li><Link href="/">Cancellation & Returns</Link></li>
              <li><Link href="/">FAQ</Link></li>
            </ul>
          </div>

          {/* Policy */}
          <div>
            <h4 className="footer-heading">Policy</h4>
            <ul className="space-y-2">
              <li><Link href="/">Return Policy</Link></li>
              <li><Link href="/">Terms of Use</Link></li>
              <li><Link href="/">Security</Link></li>
              <li><Link href="/">Privacy</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="footer-heading">Mail Us</h4>
            <p className="text-xs text-gray-500 leading-5">
              Flipkart Clone,<br />
              Built as a Scaler Academy Assignment,<br />
              Bengaluru, Karnataka, India
            </p>
            <h4 className="footer-heading mt-4">Registered Office</h4>
            <p className="text-xs text-gray-500 leading-5">
              Flipkart Internet Private Limited,<br />
              Buildings Alyssa, Begonia & Clove Embassy Tech Village,<br />
              Bengaluru, 560103
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-6 gap-4">
          <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500">
            <span>💳 Become a Seller</span>
            <span>⭐ Advertise</span>
            <span>🎁 Gift Cards</span>
            <span>❓ Help Center</span>
          </div>
          <p className="text-xs text-gray-600">
            © 2024 Flipkart Clone. Built with ❤️ for Scaler Academy.
          </p>
        </div>
      </div>
    </footer>
  );
}
