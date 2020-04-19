
export class Utils {
    
    public static toMoneyNumber(x: number, decimalDigits: number) : string {
        // first convert the number to max 2 decimal digits
        let a = Math.pow(10, decimalDigits);
        let b = Math.round(x * a) / a;
        // then convert to string
        let str = b.toLocaleString();
        
        return str;
    }
    
}
