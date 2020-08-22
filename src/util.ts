export class Util{
    static empty(data: any) {
        return data === undefined || data == null || data === '' || data === ' ' || data === 0;
      }
      static emptyNaN(data: any) {
        return data === undefined || isNaN(+data) || data === null || data === '' || data === ' ' || data === 0;
      }
    
      static esMultiplo(numero: number, multiplo: number) {
        const resto = numero % multiplo;
        return resto === 0;
      }
}