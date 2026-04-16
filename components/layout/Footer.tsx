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

          {/* Group Companies */}
          <div>
            <h4 className="footer-heading">Group Companies</h4>
            <ul className="space-y-2">
              <li><Link href="/">Myntra</Link></li>
              <li><Link href="/">Cleartrip</Link></li>
              <li><Link href="/">Shopsy</Link></li>
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

          {/* Consumer Policy */}
          <div>
            <h4 className="footer-heading">Consumer Policy</h4>
            <ul className="space-y-2">
              <li><Link href="/">Cancellation & Returns</Link></li>
              <li><Link href="/">Terms of Use</Link></li>
              <li><Link href="/">Security</Link></li>
              <li><Link href="/">Privacy</Link></li>
              <li><Link href="/">Grievance Redressal</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-6 gap-4">
          <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500">
            <span>Become a Seller</span>
            <span>Advertise</span>
            <span>Gift Cards</span>
            <span>Help Center</span>
          </div>
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Flipkart Clone &mdash;
          </p>
        </div>
      </div>
    </footer>
  );
}
