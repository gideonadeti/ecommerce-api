import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCartItemDto {
  /**
   * Product's ID
   * @example '123e4567-e89b-12d3-a456-426655440000'
   */
  @IsString()
  @IsNotEmpty()
  productId: string;

  /**
   * Product's quantity
   * @example 1
   */
  @IsInt()
  @IsNotEmpty()
  quantity: number;
}
