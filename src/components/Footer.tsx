import logo from "../logo.svg";

interface FooterProps {}

const Footer: React.FC<FooterProps> = () => {
    return (
        <footer className="footer mt-auto py-3 bg-light">
            <div className="d-flex flex-row justify-content-center gap-1 align-items-center text-center text-muted">
                <img src={logo} alt="company" width={25} />
                <span>Company 2026 Ⓒ</span>
            </div>
        </footer>
    );
};

export default Footer;
