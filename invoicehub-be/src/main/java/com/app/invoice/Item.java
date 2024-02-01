package com.app.invoice;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Item {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	private Double quantity;

	private String unit;

	private String itemName;

	private Double price;

	public Item(Double quantity, String unit, String itemName, Double price) {
		this.quantity = quantity;
		this.unit = unit;
		this.itemName = itemName;
		this.price = price;
	}

}
