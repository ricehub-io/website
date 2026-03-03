import { StarIcon } from "@heroicons/react/24/outline";

interface ReactiveStarIconProps {
    solid?: boolean;
    className?: string;
}

export default function ReactiveStarIcon({
    solid,
    className,
}: ReactiveStarIconProps) {
    return (
        <StarIcon
            className={`size-6 transition-colors duration-300 ${solid ? "animate-scale stroke-accent fill-accent" : "fill-transparent"} ${className}`}
        />
    );
}
