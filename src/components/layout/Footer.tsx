export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Tech Blog. All rights reserved.</p>
      </div>
    </footer>
  );
}
