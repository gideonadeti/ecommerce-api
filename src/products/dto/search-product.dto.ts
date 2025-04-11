import { IsString, IsNumber, Min } from 'class-validator';

export class SearchProductDto {
  /**
   * Partial name of the product to search for
   * @example "laptop"
   */
  @IsString()
  name?: string;

  /**
   * Minimum product price (inclusive)
   * @example 9.99
   */
  @IsNumber()
  @Min(0)
  minPrice?: number;

  /**
   * Maximum product price (inclusive)
   * @example 99.99
   */
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}
