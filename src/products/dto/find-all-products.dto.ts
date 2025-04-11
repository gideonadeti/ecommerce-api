import {
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class FindAllProductsDto {
  /** Optional search term (partial match on product name)
   * @example 'shoe'
   */
  @IsString()
  name?: string;

  /** Minimum price filter
   * @example 9.99
   */
  @IsNumber()
  @Min(0)
  minPrice?: number;

  /** Maximum price filter
   * @example 99.99
   */
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  /** Sort by this field */
  @IsOptional()
  @IsIn(['price', 'name', 'createdAt'])
  sortBy?: 'price' | 'name' | 'createdAt' = 'createdAt';

  /** Sort order: ascending or descending */
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';

  /** Results per page */
  @IsPositive()
  limit?: number = 10;

  /** Page number */
  @IsPositive()
  page?: number = 1;
}
