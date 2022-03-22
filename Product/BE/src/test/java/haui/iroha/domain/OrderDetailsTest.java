package haui.iroha.domain;

import static org.assertj.core.api.Assertions.assertThat;

import haui.iroha.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class OrderDetailsTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(OrderDetails.class);
        OrderDetails orderDetails1 = new OrderDetails();
        orderDetails1.setIdOrderDetail(1L);
        OrderDetails orderDetails2 = new OrderDetails();
        orderDetails2.setIdOrderDetail(orderDetails1.getIdOrderDetail());
        assertThat(orderDetails1).isEqualTo(orderDetails2);
        orderDetails2.setIdOrderDetail(2L);
        assertThat(orderDetails1).isNotEqualTo(orderDetails2);
        orderDetails1.setIdOrderDetail(null);
        assertThat(orderDetails1).isNotEqualTo(orderDetails2);
    }
}