import logo from "../logo.svg";

const Footer = () => {
    return (
        <footer class="footer mt-auto py-3 bg-light">
            <div class="d-flex flex-row justify-content-center gap-1 align-items-center text-center text-muted">
                <img src={logo} alt="company" width={25} />
                <span>Company 2026 Ⓒ</span>
            </div>
        </footer>
    );
};

export default Footer;
