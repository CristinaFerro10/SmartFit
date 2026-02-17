interface LoadingProps {
    message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = "Caricamento..." }) => {
    return (
        <div className="absolute inset-0 bg-white/75 flex items-center justify-center z-30">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-600 font-medium">{message}</p>
            </div>
        </div>
    );
};

const LoadingContent: React.FC<LoadingProps> = ({ message = "Caricamento..." }) => {
    return (
        <div>
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-600 font-medium">{message}</p>
            </div>
        </div>
    );
};

export { Loading, LoadingContent };