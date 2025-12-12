interface LoadingScreenProps {}

const LoadingScreen: React.FC<LoadingScreenProps> = () => {
    return (
        <div
            className="d-flex justify-content-center align-items-center vh-100 w-100 position-fixed top-0 start-0 bg-white bg-opacity-75"
            style={{ zIndex: 1050 }}
        >
            <div className="spinner-border text-secondary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
};

export default LoadingScreen;
