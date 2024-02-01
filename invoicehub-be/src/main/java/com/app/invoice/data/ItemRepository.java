package com.app.invoice.data;

import com.app.invoice.Item;

import org.springframework.data.repository.CrudRepository;

public interface ItemRepository extends CrudRepository<Item, Long> {

}
